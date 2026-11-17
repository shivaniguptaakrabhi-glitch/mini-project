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

describe("POST /api/users/:id/follow", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should follow a user successfully", async () => {

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
test("should return 404 when user is not found", async () => {

  (pool.query as jest.Mock).mockResolvedValueOnce({
    rows: [],
  });

  const response = await request(app)
    .post("/api/users/2/follow")
    .set("Authorization", "Bearer fake-token");

  expect(response.status).toBe(404);
  expect(response.body.message).toBe("User not found");

});
test("should return 409 when user is already followed", async () => {

  (pool.query as jest.Mock)
    .mockResolvedValueOnce({
      rows: [{ id: 2 }],
    })
    .mockResolvedValueOnce({
      rowCount: 0,
    });

  const response = await request(app)
    .post("/api/users/2/follow")
    .set("Authorization", "Bearer fake-token");

  expect(response.status).toBe(409);
  expect(response.body.message).toBe("You already follow this user");

});
test("should return 500 when database throws an error", async () => {

  (pool.query as jest.Mock).mockRejectedValue(
    new Error("Database connection failed")
  );

  const response = await request(app)
    .post("/api/users/2/follow")
    .set("Authorization", "Bearer fake-token");

  expect(response.status).toBe(500);

});
});

describe("DELETE /api/users/:id/follow", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

test("should unfollow a user successfully", async () => {

  (pool.query as jest.Mock).mockResolvedValue({
    rowCount: 1,
  });

  const response = await request(app)
    .delete("/api/users/2/follow")
    .set("Authorization", "Bearer fake-token");

  expect(response.status).toBe(200);
  expect(response.body.message).toBe("Unfollowed successfully");

});

test("should return 404 when user is not being followed", async () => {

  (pool.query as jest.Mock).mockResolvedValue({
    rowCount: 0,
  });

  const response = await request(app)
    .delete("/api/users/2/follow")
    .set("Authorization", "Bearer fake-token");

  expect(response.status).toBe(404);
  expect(response.body.message).toBe("You are not following this user");

});
test("should return 500 when database throws an error", async () => {

  (pool.query as jest.Mock).mockRejectedValue(
    new Error("Database connection failed")
  );

  const response = await request(app)
    .delete("/api/users/2/follow")
    .set("Authorization", "Bearer fake-token");

  expect(response.status).toBe(500);

});
});


describe("GET /api/users/:id/followers", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

test("should return followers", async () => {

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
  expect(Array.isArray(response.body)).toBe(true);

});
test("should return 500 when database throws an error", async () => {

  (pool.query as jest.Mock).mockRejectedValue(
    new Error("Database connection failed")
  );

  const response = await request(app)
    .get("/api/users/1/followers")
    .set("Authorization", "Bearer fake-token");

  expect(response.status).toBe(500);

});
});
describe("GET /api/users/:id/following", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

 test("should return following users", async () => {

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
    .get("/api/users/1/following")
    .set("Authorization", "Bearer fake-token");

  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);

});
test("should return 500 when database throws an error", async () => {

  (pool.query as jest.Mock).mockRejectedValue(
    new Error("Database connection failed")
  );

  const response = await request(app)
    .get("/api/users/1/following")
    .set("Authorization", "Bearer fake-token");

  expect(response.status).toBe(500);

});
});

