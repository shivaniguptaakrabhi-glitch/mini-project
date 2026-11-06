import { Router } from "express";
import { authenticate } from "../midleware/auth";
import { validate } from "../midleware/validate";
import * as c from "../controllers/controllers";
import {
  createPostSchema,
  idParamSchema,
  loginSchema,
  paginationSchema,
  signupSchema,
  updatePostSchema,
} from "../schema/schemas";

const router = Router();

// Public
router.post("/auth/signup", validate({ body: signupSchema }), c.signup);
router.post("/auth/login", validate({ body: loginSchema }), c.login);

// Everything below needs a valid JWT
router.use(authenticate);

router.get("/users/me", c.getme);
router.get("/users/:id", validate({ params: idParamSchema }), c.getuser);
router.post("/users/:id/follow", validate({ params: idParamSchema }), c.followUser);
router.delete("/users/:id/follow", validate({ params: idParamSchema }), c.unfollowUser);
router.get("/users/:id/followers", validate({ params: idParamSchema }), c.getfollowers);
router.get("/users/:id/following", validate({ params: idParamSchema }), c.getFollowing);

router.post("/posts", validate({ body: createPostSchema }), c.createPost);
router.get("/posts/:id", validate({ params: idParamSchema }), c.getPost);
router.patch("/posts/:id", validate({ params: idParamSchema, body: updatePostSchema }), c.updatePost);
router.delete("/posts/:id", validate({ params: idParamSchema }), c.deletePost);

export default router;