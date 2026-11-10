import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../config/db";
import { signToken } from "../midleware/auth";
import { AppError } from "../utils/error";
import { logger } from "../utils/logger";
import { publishUserSignup } from "../kafka/producer";

const signup = async (req:Request, res: Response, next: NextFunction) => {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const hash = await bcrypt.hash(password, 10);
    const results = await pool.query(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, $3)
       RETURNING id, username, email, role, created_at`,
      [username, email, hash]
    );
    const user = results.rows[0];
    
    await publishUserSignup(user);
    
    logger.info({ userId: user.id }, "User signed up");
    res.status(201).json({
      user,
      token: signToken({ id: user.id, username: user.username, role: user.role }),
    });
  } catch (err: any) {
    if (err.code === "23505") {
      const field = String(err.constraint).includes("email") ? "Email" : "Username";
      return next(new AppError(409, `${field} already taken`));
    }
    next(err);
  }
}

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.body.email;
    const password  = req.body.password;
    const results = await pool.query("SELECT id, username, email, password FROM users WHERE email = $1", [email]);
    const user = results.rows[0];
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) {
      logger.warn({ email }, "Failed login attempt");
      throw new AppError(401, "Invalid email or password");
    }
    logger.info({ userId: user.id }, "User logged in");
    res.json({
      user: { username: user.username, email: user.email, role: user.role },
      token: signToken({ id: user.id, username: user.username, role: user.role }),
    });
  } catch (err) {
    next(err);
  }
}

const getme = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results= await pool.query(
      "SELECT id, username, email, role, created_at FROM users WHERE id = $1",
      [req.user!.id]
    );
    if (!results.rows[0]) throw new AppError(404, "User not found");
    res.json(results.rows[0]);
  } catch (err) {
    next(err);
  }
}

const getuser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await pool.query(
      `SELECT u.id, u.username, u.role,
         (SELECT COUNT(*)::int FROM follows WHERE following_id = u.id) AS followers_count,
         (SELECT COUNT(*)::int FROM follows WHERE follower_id  = u.id) AS following_count
       FROM users u WHERE u.id = $1`,
      [Number(req.params.id)]
    );
    if (!results.rows[0]) throw new AppError(404, "User not found");
    res.json(results.rows[0]);
  } catch (err) {
    next(err);
  }
}


const followUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetId = Number(req.params.id);
    const me = req.user!.id;
    const target = await pool.query("SELECT id FROM users WHERE id = $1", [targetId]);
    if (!target.rows[0]) throw new AppError(404, "User not found");

    const result = await pool.query(
      `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [me, targetId]
    );
    if (!result.rowCount) throw new AppError(409, "You already follow this user");
    logger.info({ follower: me, followed: targetId }, "User followed");
    res.status(201).json({ message: "Followed successfully" });
  } catch (err) {
    next(err);
  }
}

const unfollowUser =  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetId = Number(req.params.id);
    const result = await pool.query(
      "DELETE FROM follows WHERE follower_id = $1 AND following_id = $2",
      [req.user!.id, targetId]
    );
    if (!result.rowCount) throw new AppError(404, "You are not following this user");
    logger.info({ follower: req.user!.id, unfollowed: targetId }, "User unfollowed");
    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    next(err);
  }
}

const getfollowers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results= await pool.query(
      `SELECT u.id, u.username, f.created_at AS followed_at
       FROM follows f JOIN users u ON u.id = f.follower_id
       WHERE f.following_id = $1 ORDER BY f.created_at DESC`,
      [Number(req.params.id)]
    );
    res.json(results.rows);
  } catch (err) {
    next(err);
  }
}

const getFollowing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results= await pool.query(
      `SELECT u.id, u.username, f.created_at AS followed_at
       FROM follows f JOIN users u ON u.id = f.following_id
       WHERE f.follower_id = $1 ORDER BY f.created_at DESC`,
      [Number(req.params.id)]
    );
    res.json(results.rows);
  } catch (err) {
    next(err);
  }
}

const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, body, status } = req.body;
    const results= await pool.query(
      `INSERT INTO posts (title, body, user_id, status) VALUES ($1, $2, $3, $4) RETURNING id, title, body, user_id, status, created_at`,
      [title, body, req.user!.id, status]
    );
    logger.info({ postId: results.rows[0].id, userId: req.user!.id }, "Post created");
    res.status(201).json(results.rows[0]);
  } catch (err) {
    next(err);
  }
}

const getPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results= await pool.query(
      `SELECT p.id, p.title, p.body,p.user_id,p.created_at, u.username FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id = $1`,
      [Number(req.params.id)]
    );
    const post = results.rows[0];
    // drafts are visible only to their owner
    if (!post || (post.status === "draft" && post.user_id !== req.user!.id)) {
      throw new AppError(404, "Post not found");
    }
    res.json(post);
  } catch (err) {
    next(err);
  }
}

const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const existing = await pool.query("SELECT user_id FROM posts WHERE id = $1", [id]);
    if (!existing.rows[0]) throw new AppError(404, "Post not found");
    if (existing.rows[0].user_id !== req.user!.id) {
      throw new AppError(403, "You can only edit your own posts");
    }

    const { title, body, status } = req.body;
    const results= await pool.query(
      `UPDATE posts SET title = COALESCE($1, title), body = COALESCE($2, body), status = COALESCE($3, status)
       WHERE id = $4 RETURNING id, title, body, user_id, status, created_at`,
      [title ?? null, body ?? null, status ?? null, id]
    );
    res.json(results.rows[0]);
  } catch (err) {
    next(err);
  }
}

const deletePost =  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const existing = await pool.query("SELECT user_id FROM posts WHERE id = $1", [id]);
    if (!existing.rows[0]) throw new AppError(404, "Post not found");
    const isOwner = existing.rows[0].user_id === req.user!.id;
    if (!isOwner && req.user!.role !== "admin") {
      throw new AppError(403, "Not allowed to delete this post");
    }
    await pool.query("DELETE FROM posts WHERE id = $1", [id]);
    logger.info({ postId: id, by: req.user!.id }, "Post deleted");
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export{
  signup,
  login,
  getme,
  getuser,
  followUser,
  unfollowUser,
  getfollowers,
  getFollowing,
  getPost,
  createPost,
  deletePost,
  updatePost
}