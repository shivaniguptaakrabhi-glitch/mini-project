import request from "supertest";

import app from "../app";
import { pool } from "../config/db";

jest.mock("../config/db", () => ({
  pool: {
    query: jest.fn(),
  },
}));


jest.mock("../midleware/auth", () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = {
      id: 1,
      username: "shivani",
      role: "user",
    };
    next();
  },
  signToken: jest.fn(),
}));

describe("POST /api/posts", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a post successfully", async () => {

  (pool.query as jest.Mock).mockResolvedValue({
    rows: [
      {
        id: 1,
        title: "My First Post",
        body: "This is my first post",
        user_id: 1,
        status: "published",
        created_at: new Date(),
      },
    ],
  });

  const response = await request(app)
    .post("/api/posts")
    .set("Authorization", "Bearer fake-token")
    .send({
      title: "My First Post",
      body: "This is my first post",
      status: "published",
    });

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty("title");
  expect(response.body).toHaveProperty("body");
  expect(response.body).toHaveProperty("status");

});

test("should return 500 when database throws an error", async () => {

  (pool.query as jest.Mock).mockRejectedValue(
    new Error("Database connection failed")
  );

  const response = await request(app)
    .post("/api/posts")
    .set("Authorization", "Bearer fake-token")
    .send({
      title: "My First Post",
      body: "This is my first post",
      status: "published",
    });

  expect(response.status).toBe(500);

});

});

describe("GET /api/posts/:id", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

 test("should return a post", async () => {

  (pool.query as jest.Mock).mockResolvedValue({
    rows: [
      {
        id: 1,
        title: "My Post",
        body: "Hello",
        status: "published",
        user_id: 1,
        username: "shivani",
      },
    ],
  });

  const response = await request(app)
    .get("/api/posts/1")
    .set("Authorization", "Bearer fake-token");

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty("title");
  expect(response.body).toHaveProperty("body");

});

test("should return 404 when post is not found", async () => {

  (pool.query as jest.Mock).mockResolvedValue({
    rows: [],
  });

  const response = await request(app)
    .get("/api/posts/100")
    .set("Authorization", "Bearer fake-token");

  expect(response.status).toBe(404);
  expect(response.body.message).toBe("Post not found");

});

test("should return 404 when draft belongs to another user", async () => {

  (pool.query as jest.Mock).mockResolvedValue({
    rows: [
      {
        id: 1,
        title: "Draft",
        body: "Hidden",
        status: "draft",
        user_id: 2,
      },
    ],
  });

  const response = await request(app)
    .get("/api/posts/1")
    .set("Authorization", "Bearer fake-token");

  expect(response.status).toBe(404);
  expect(response.body.message).toBe("Post not found");

});

test("should return 500 when database throws an error", async () => {

  (pool.query as jest.Mock).mockRejectedValue(
    new Error("Database connection failed")
  );

  const response = await request(app)
    .get("/api/posts/1")
    .set("Authorization", "Bearer fake-token");

  expect(response.status).toBe(500);

});

});
describe("PATCH /api/posts/:id", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

test("should update a post successfully", async () => {

  (pool.query as jest.Mock)
    .mockResolvedValueOnce({
      rows: [{ user_id: 1 }],
    })
    .mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          title: "Updated Title",
          body: "Updated Body",
          user_id: 1,
          status: "published",
        },
      ],
    });

  const response = await request(app)
    .patch("/api/posts/1")
    .set("Authorization", "Bearer fake-token")
    .send({
      title: "Updated Title",
      body: "Updated Body",
      status: "published",
    });

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty("title");
  expect(response.body).toHaveProperty("body");
  expect(response.body).toHaveProperty("status");

});

test("should return 404 when post is not found", async () => {

  (pool.query as jest.Mock).mockResolvedValueOnce({
    rows: [],
  });

  const response = await request(app)
    .patch("/api/posts/1")
    .set("Authorization", "Bearer fake-token")
    .send({
      title: "Updated Title",
    });

  expect(response.status).toBe(404);
  expect(response.body.message).toBe("Post not found");

});

test("should return 403 when updating another user's post", async () => {

  (pool.query as jest.Mock).mockResolvedValueOnce({
    rows: [{ user_id: 2 }],
  });

  const response = await request(app)
    .patch("/api/posts/1")
    .set("Authorization", "Bearer fake-token")
    .send({
      title: "Updated Title",
    });

  expect(response.status).toBe(403);
  expect(response.body.message).toBe("You can only edit your own posts");

});

test("should return 500 when database throws an error", async () => {

  (pool.query as jest.Mock).mockRejectedValue(
    new Error("Database connection failed")
  );

  const response = await request(app)
    .patch("/api/posts/1")
    .set("Authorization", "Bearer fake-token")
    .send({
      title: "Updated Title",
    });

  expect(response.status).toBe(500);

});

});

describe("DELETE /api/posts/:id", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

 test("should delete a post successfully", async () => {

  (pool.query as jest.Mock)
    .mockResolvedValueOnce({
      rows: [{ user_id: 1 }],
    })
    .mockResolvedValueOnce({});

  const response = await request(app)
    .delete("/api/posts/1")
    .set("Authorization", "Bearer fake-token");

  expect(response.status).toBe(204);

});

test("should return 404 when post is not found", async () => {

  (pool.query as jest.Mock).mockResolvedValueOnce({
    rows: [],
  });

  const response = await request(app)
    .delete("/api/posts/1")
    .set("Authorization", "Bearer fake-token");

  expect(response.status).toBe(404);
  expect(response.body.message).toBe("Post not found");

});
test("should return 403 when deleting another user's post", async () => {

  (pool.query as jest.Mock).mockResolvedValueOnce({
    rows: [{ user_id: 2 }],
  });

  const response = await request(app)
    .delete("/api/posts/1")
    .set("Authorization", "Bearer fake-token");

  expect(response.status).toBe(403);
  expect(response.body.message).toBe("Not allowed to delete this post");

});
});
