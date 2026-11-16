import request from "supertest";
import bcrypt from "bcryptjs";

import app from "../app";
import { pool } from "../config/db";
import { publishUserSignup } from "../kafka/producer";
import { signToken } from "../midleware/auth";

jest.mock("../config/db", () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock("../kafka/producer", () => ({
  publishUserSignup: jest.fn(),
}));

jest.mock("../midleware/auth", () => ({
  ...jest.requireActual("../midleware/auth"),
  signToken: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
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

  it("should create a post successfully", async () => {

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
    expect(response.body.title).toBe("My First Post");
    expect(response.body.status).toBe("published");

  });

});

describe("GET /api/posts/:id", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a post", async () => {

    (pool.query as jest.Mock).mockResolvedValue({
      rows: [
        {
          id: 1,
          title: "My First Post",
          body: "This is my first post",
          user_id: 1,
          username: "shivani",
          status: "published",
          created_at: new Date(),
        },
      ],
    });

    const response = await request(app)
      .get("/api/posts/1")
      .set("Authorization", "Bearer fake-token");

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("My First Post");
    expect(response.body.username).toBe("shivani");

  });

});
describe("PATCH /api/posts/:id", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a post successfully", async () => {

    (pool.query as jest.Mock)
      .mockResolvedValueOnce({
        rows: [
          {
            user_id: 1,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            title: "Updated Post",
            body: "Updated Body",
            user_id: 1,
            status: "published",
            created_at: new Date(),
          },
        ],
      });

    const response = await request(app)
      .patch("/api/posts/1")
      .set("Authorization", "Bearer fake-token")
      .send({
        title: "Updated Post",
        body: "Updated Body",
        status: "published",
      });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Updated Post");
    expect(response.body.status).toBe("published");

  });

});

describe("DELETE /api/posts/:id", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a post successfully", async () => {

    (pool.query as jest.Mock)
      .mockResolvedValueOnce({
        rows: [
          {
            user_id: 1,
          },
        ],
      })
      .mockResolvedValueOnce({});

    const response = await request(app)
      .delete("/api/posts/1")
      .set("Authorization", "Bearer fake-token");

    expect(response.status).toBe(204);

  });

});