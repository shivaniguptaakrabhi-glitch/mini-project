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

describe("POST /api/users/:id/follow", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should follow a user successfully", async () => {

    (pool.query as jest.Mock)
      .mockResolvedValueOnce({
        rows: [{ id: 2 }],
      })
      .mockResolvedValueOnce({
        rowCount: 1,
      });

    const response = await request(app)
      .post("/api/users/2/follow")
      .set("Authorization", "Bearer fake-token");

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Followed successfully");

  });

});

describe("DELETE /api/users/:id/follow", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should unfollow a user successfully", async () => {

    (pool.query as jest.Mock).mockResolvedValue({
      rowCount: 1,
    });

    const response = await request(app)
      .delete("/api/users/2/follow")
      .set("Authorization", "Bearer fake-token");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Unfollowed successfully");

  });

});

describe("GET /api/users/:id/followers", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return followers list", async () => {

    (pool.query as jest.Mock).mockResolvedValue({
      rows: [
        {
          id: 2,
          username: "rahul",
          followed_at: new Date(),
        },
      ],
    });

    const response = await request(app)
      .get("/api/users/1/followers")
      .set("Authorization", "Bearer fake-token");

    expect(response.status).toBe(200);
    expect(response.body[0].username).toBe("rahul");

  });

});

describe("GET /api/users/:id/following", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return following list", async () => {

    (pool.query as jest.Mock).mockResolvedValue({
      rows: [
        {
          id: 3,
          username: "amit",
          followed_at: new Date(),
        },
      ],
    });

    const response = await request(app)
      .get("/api/users/1/following")
      .set("Authorization", "Bearer fake-token");

    expect(response.status).toBe(200);
    expect(response.body[0].username).toBe("amit");

  });

});

