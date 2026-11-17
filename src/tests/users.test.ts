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

describe("POST /api/auth/signup", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a new user successfully", async () => {

    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

    (pool.query as jest.Mock).mockResolvedValue({
      rows: [{
        id: 1,
        username: "shivani",
        email: "shivani@test.com",
        role: "user",
        created_at: new Date(),
      }],
    });

    (publishUserSignup as jest.Mock).mockResolvedValue(undefined);

    (signToken as jest.Mock).mockReturnValue("fake-jwt-token");

    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        username: "shivani",
        email: "shivani@test.com",
        password: "Password123",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("token");

  });

  test("should return 409 when email already exists", async () => {

    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

    (pool.query as jest.Mock).mockRejectedValue({
      code: "23505",
      constraint: "users_email_key",
    });

    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        username: "shivani",
        email: "shivani@test.com",
        password: "Password123",
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("Email already taken");

  });

  test("should return 409 when username already exists", async () => {

    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

    (pool.query as jest.Mock).mockRejectedValue({
      code: "23505",
      constraint: "users_username_key",
    });

    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        username: "shivani",
        email: "shivani@test.com",
        password: "Password123",
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("Username already taken");

  });
test("should return 500 when database throws an error", async () => {

  (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

  (pool.query as jest.Mock).mockRejectedValue(
    new Error("Database connection failed")
  );

  const response = await request(app)
    .post("/api/auth/signup")
    .send({
      username: "shivani",
      email: "shivani@test.com",
      password: "Password123",
    });

  expect(response.status).toBe(500);

});
});

describe("POST /api/auth/login", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should login successfully", async () => {

    (pool.query as jest.Mock).mockResolvedValue({
      rows: [
        {
          id: 1,
          username: "shivani",
          email: "shivani@test.com",
          password: "hashedPassword",
          role: "user",
        },
      ],
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    (signToken as jest.Mock).mockReturnValue("fake-token");

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "shivani@test.com",
        password: "Password123",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("token");

  });
test("should return 401 when email does not exist", async () => {

  (pool.query as jest.Mock).mockResolvedValue({
    rows: [],
  });

  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "unknown@test.com",
      password: "Password123",
    });

  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Invalid email or password");

});
test("should return 500 when database throws an error", async () => {

  (pool.query as jest.Mock).mockRejectedValue(
    new Error("Database connection failed")
  );

  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "shivani@test.com",
      password: "Password123",
    });

  expect(response.status).toBe(500);

});
});

describe("GET /api/users/me", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return logged in user", async () => {

    (pool.query as jest.Mock).mockResolvedValue({
      rows: [
        {
          id: 1,
          username: "shivani",
          email: "shivani@test.com",
          role: "user",
          created_at: new Date(),
        },
      ],
    });

    const response = await request(app)
      .get("/api/users/me")
      .set("Authorization", "Bearer fake-token");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("username");
    expect(response.body).toHaveProperty("email");

  });
test("should return 404 when user is not found", async () => {

  (pool.query as jest.Mock).mockResolvedValue({
    rows: [],
  });

  const response = await request(app)
    .get("/api/users/me")
    .set("Authorization", "Bearer fake-token");

  expect(response.status).toBe(404);
  expect(response.body.message).toBe("User not found");

});
test("should return 500 when database throws an error", async () => {

  (pool.query as jest.Mock).mockRejectedValue(
    new Error("Database connection failed")
  );

  const response = await request(app)
    .get("/api/users/me")
    .set("Authorization", "Bearer fake-token");

  expect(response.status).toBe(500);

});
});

describe("GET /api/users/:id", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return user by id", async () => {

    (pool.query as jest.Mock).mockResolvedValue({
      rows: [
        {
          id: 1,
          username: "shivani",
          role: "user",
          followers_count: 10,
          following_count: 5,
        },
      ],
    });

    const response = await request(app)
      .get("/api/users/1")
      .set("Authorization", "Bearer fake-token");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("username");
    expect(response.body).toHaveProperty("followers_count");
    expect(response.body).toHaveProperty("following_count");

  });
test("should return 404 when user is not found", async () => {

  (pool.query as jest.Mock).mockResolvedValue({
    rows: [],
  });

  const response = await request(app)
    .get("/api/users/100")
    .set("Authorization", "Bearer fake-token");

  expect(response.status).toBe(404);
  expect(response.body.message).toBe("User not found");

});
test("should return 500 when database throws an error", async () => {

  (pool.query as jest.Mock).mockRejectedValue(
    new Error("Database connection failed")
  );

  const response = await request(app)
    .get("/api/users/1")
    .set("Authorization", "Bearer fake-token");

  expect(response.status).toBe(500);

});
});

