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

  it("should create a new user successfully", async () => {

    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

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

    expect(response.body.user).toEqual({
      id: 1,
      username: "shivani",
      email: "shivani@test.com",
      role: "user",
      created_at: expect.any(String),
    });

    expect(response.body.token).toBe("fake-jwt-token");

    expect(pool.query).toHaveBeenCalledTimes(1);

    expect(bcrypt.hash).toHaveBeenCalledWith("Password123", 10);

    expect(publishUserSignup).toHaveBeenCalledTimes(1);

    expect(signToken).toHaveBeenCalledTimes(1);

  });

});

describe("POST /api/auth/login", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should login successfully", async () => {

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
    expect(response.body.user.username).toBe("shivani");
    expect(response.body.token).toBe("fake-token");

  });

});

describe("GET /api/users/me", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return logged in user", async () => {

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
    expect(response.body.username).toBe("shivani");
    expect(response.body.email).toBe("shivani@test.com");

  });

});

describe("GET /api/users/:id", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user by id", async () => {

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
    expect(response.body.username).toBe("shivani");
    expect(response.body.followers_count).toBe(10);

  });

});