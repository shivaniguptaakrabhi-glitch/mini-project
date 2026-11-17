import request from "supertest";
import app from "../app";
import { pool} from "../config/db";

import { connectProducer, disconnectProducer } from "../kafka/producer";
import express from "express";


const errorApp = express();

errorApp.get("/error", () => {
  throw new Error("Boom");
});

describe("Integration Tests - Signup", () => {

    beforeAll(async () => {
      await connectProducer();
    });
  test("should create a new user", async () => {

    const id = Date.now();

    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        username: `user${id}`,
        email: `user${id}@test.com`,
        password: "Password123",
      });

    expect(response.status).toBe(201);

  });
});

describe("Integration Tests - Login", () => {

    beforeAll(async () => {
       await connectProducer();
    });
  test("should login successfully", async () => {

    const id = Date.now();

    const username = `user${id}`;
    const email = `user${id}@test.com`;
    const password = "Password123";

    // Create user
    await request(app)
      .post("/api/auth/signup")
      .send({
        username,
        email,
        password,
      });

    // Login
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    expect(response.status).toBe(200);

  });

});

describe("Integration Tests - Get Current User", () => {

   beforeAll(async () => {
      await connectProducer();
   });
  test("should return the logged in user", async () => {

    const id = Date.now();

    const username = `user${id}`;
    const email = `user${id}@test.com`;
    const password = "Password123";

    await request(app)
      .post("/api/auth/signup")
      .send({
        username,
        email,
        password,
      });

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    const token = loginResponse.body.token;

    // Get Current User
    const response = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

  });

});
describe("Integration Tests - Get User By ID", () => {
   beforeAll(async () => {
  await connectProducer();
   });
  test("should return user by id", async () => {

    const id = Date.now();

    const username = `user${id}`;
    const email = `user${id}@test.com`;
    const password = "Password123";

    // Signup
    const signupResponse = await request(app)
      .post("/api/auth/signup")
      .send({
        username,
        email,
        password,
      });

    // Login
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    const token = loginResponse.body.token;
    const userId = signupResponse.body.user.id;

    // Get User By ID
    const response = await request(app)
      .get(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

  });

});
describe("Integration Tests - Create Post", () => {

    beforeAll(async () => {
  await connectProducer();
});
  test("should create a new post", async () => {

    const id = Date.now();

    const username = `user${id}`;
    const email = `user${id}@test.com`;
    const password = "Password123";

    // Signup
    await request(app)
      .post("/api/auth/signup")
      .send({
        username,
        email,
        password,
      });

    // Login
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    const token = loginResponse.body.token;

    const response = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "My First Post",
            body: "This is my first integration test post.",
            status: "published",
        });

    expect(response.status).toBe(201);

  });

});

describe("Integration Tests - Get Post By ID", () => {
  beforeAll(async () => {
  await connectProducer();
});
  test("should return a post by id", async () => {

    const id = Date.now();

    const username = `user${id}`;
    const email = `user${id}@test.com`;
    const password = "Password123";

    // Signup
    await request(app)
      .post("/api/auth/signup")
      .send({
        username,
        email,
        password,
      });

    // Login
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    const token = loginResponse.body.token;

    // Create Post
    const createResponse = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "My First Post",
        body: "This is my first integration test post.",
        status: "published",
      });

    const postId = createResponse.body.id;

    // Get Post
    const response = await request(app)
      .get(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

  });

});

describe("Integration Tests - Update Post", () => {
   
    beforeAll(async () => {
  await connectProducer();
});
  test("should update a post", async () => {

    const id = Date.now();

    const username = `user${id}`;
    const email = `user${id}@test.com`;
    const password = "Password123";

    // Signup
    await request(app)
      .post("/api/auth/signup")
      .send({
        username,
        email,
        password,
      });

    // Login
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    const token = loginResponse.body.token;

    // Create Post
    const createResponse = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Old Title",
        body: "Old Body",
        status: "published",
      });

    const postId = createResponse.body.id;

    // Update Post
    const response = await request(app)
       .patch(`/api/posts/${postId}`)
       .set("Authorization", `Bearer ${token}`)
       .send({
        title: "New Title",
        body: "New Body",
        status: "published",
       });

    expect(response.status).toBe(200);
  });
  
});

describe("Integration Tests - Delete Post", () => {

    beforeAll(async () => {
  await connectProducer();
});
  test("should delete a post", async () => {

    const id = Date.now();

    const username = `user${id}`;
    const email = `user${id}@test.com`;
    const password = "Password123";

    // Signup
    await request(app)
      .post("/api/auth/signup")
      .send({
        username,
        email,
        password,
      });

    // Login
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    const token = loginResponse.body.token;

    // Create Post
    const createResponse = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Delete Test",
        body: "This post will be deleted.",
        status: "published",
      });

    const postId = createResponse.body.id;

    // Delete Post
    const response = await request(app)
      .delete(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);

  });

});

describe("Integration Tests - Follow User", () => {

    beforeAll(async () => {
  await connectProducer();
});
  test("should follow another user", async () => {

    const id = Date.now();

    // User A
    const username1 = `userA${id}`;
    const email1 = `userA${id}@test.com`;
    const password1 = "Password123";

    // User B
    const username2 = `userB${id}`;
    const email2 = `userB${id}@test.com`;
    const password2 = "Password123";

    // Signup User A
    await request(app)
      .post("/api/auth/signup")
      .send({
        username: username1,
        email: email1,
        password: password1,
      });

    // Signup User B
    const signupResponse = await request(app)
      .post("/api/auth/signup")
      .send({
        username: username2,
        email: email2,
        password: password2,
      });

    const userId = signupResponse.body.user.id;

    // Login User A
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: email1,
        password: password1,
      });

    const token = loginResponse.body.token;

    // Follow User B
    const response = await request(app)
      .post(`/api/users/${userId}/follow`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(201);

  });

});
describe("Integration Tests - Get Followers", () => {

    beforeAll(async () => {
  await connectProducer();
});
  test("should return followers of a user", async () => {

    const id = Date.now();

    // User A
    const username1 = `userA${id}`;
    const email1 = `userA${id}@test.com`;
    const password1 = "Password123";

    // User B
    const username2 = `userB${id}`;
    const email2 = `userB${id}@test.com`;
    const password2 = "Password123";

    // Signup User A
    const signupA = await request(app)
      .post("/api/auth/signup")
      .send({
        username: username1,
        email: email1,
        password: password1,
      });

    // Signup User B
    const signupB = await request(app)
      .post("/api/auth/signup")
      .send({
        username: username2,
        email: email2,
        password: password2,
      });

    // Login User A
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: email1,
        password: password1,
      });

    const token = loginResponse.body.token;

    // User A follows User B
    await request(app)
      .post(`/api/users/${signupB.body.user.id}/follow`)
      .set("Authorization", `Bearer ${token}`);

    // Get followers of User B
    const response = await request(app)
      .get(`/api/users/${signupB.body.user.id}/followers`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

});

describe("Integration Tests - Get Following", () => {

    beforeAll(async () => {
  await connectProducer();
});
  test("should return users followed by the logged in user", async () => {

    const id = Date.now();

    // User A
    const username1 = `userA${id}`;
    const email1 = `userA${id}@test.com`;
    const password1 = "Password123";

    // User B
    const username2 = `userB${id}`;
    const email2 = `userB${id}@test.com`;
    const password2 = "Password123";

    // Signup User A
    const signupA = await request(app)
      .post("/api/auth/signup")
      .send({
        username: username1,
        email: email1,
        password: password1,
      });

    // Signup User B
    const signupB = await request(app)
      .post("/api/auth/signup")
      .send({
        username: username2,
        email: email2,
        password: password2,
      });

    // Login User A
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: email1,
        password: password1,
      });

    const token = loginResponse.body.token;

    // User A follows User B
    await request(app)
      .post(`/api/users/${signupB.body.user.id}/follow`)
      .set("Authorization", `Bearer ${token}`);

    // Get following list of User A
    const response = await request(app)
      .get(`/api/users/${signupA.body.user.id}/following`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

  });

});

describe("Integration Tests - Unfollow User", () => {

    beforeAll(async () => {
  await connectProducer();
});
  test("should unfollow a user", async () => {

    const id = Date.now();

    // User A
    const username1 = `userA${id}`;
    const email1 = `userA${id}@test.com`;
    const password1 = "Password123";

    // User B
    const username2 = `userB${id}`;
    const email2 = `userB${id}@test.com`;
    const password2 = "Password123";

    // Signup User A
    await request(app)
      .post("/api/auth/signup")
      .send({
        username: username1,
        email: email1,
        password: password1,
      });

    // Signup User B
    const signupB = await request(app)
      .post("/api/auth/signup")
      .send({
        username: username2,
        email: email2,
        password: password2,
      });

    // Login User A
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: email1,
        password: password1,
      });

    const token = loginResponse.body.token;

    // Follow User B
    await request(app)
      .post(`/api/users/${signupB.body.user.id}/follow`)
      .set("Authorization", `Bearer ${token}`);

    // Unfollow User B
    const response = await request(app)
      .delete(`/api/users/${signupB.body.user.id}/follow`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200); // Change to 200 if your controller returns 200
  });

});

describe("Integration Tests - Authorization", () => {

    beforeAll(async () => {
  await connectProducer();
});
  test("should return 401 when Authorization header is missing", async () => {
  const response = await request(app)
    .post("/api/posts")
    .send({
      title: "Test",
      body: "Hello",
      status: "published",
    });

  expect(response.status).toBe(401);
  expect(response.body.message).toBe(
    "Missing or malformed Authorization header"
  );
});
test("should return 401 for an invalid token", async () => {
  const response = await request(app)
    .post("/api/posts")
    .set("Authorization", "Bearer invalid-token")
    .send({
      title: "Test",
      body: "Hello",
      status: "published",
    });

  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Invalid or expired token");
});
});
describe("Signup validation", () => {

    beforeAll(async () => {
  await connectProducer();
});
  test("should return 400 for invalid signup data", async () => {
  const response = await request(app)
    .post("/api/auth/signup")
    .send({
      username: "a",
      email: "invalid-email",
      password: "123",
    });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Validation failed");
});
});

describe("Login validation", () => {

    beforeAll(async () => {
  await connectProducer();
});
  test("should return 400 for invalid login payload", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({});

  expect(response.status).toBe(400);
});
});

describe("Unknown route", () => {

    beforeAll(async () => {
  await connectProducer();
});
  test("should return 404 for an unknown route", async () => {
  const response = await request(app).get("/does-not-exist");

  expect(response.status).toBe(404);
  expect(response.body).toEqual({
    message: "Route not found",
  });
});
});
describe("Unknown route", () => {

    beforeAll(async () => {
  await connectProducer();
});
  test("should return 400 for invalid JSON", async () => {
  const response = await request(app)
    .post("/api/auth/signup")
    .set("Content-Type", "application/json")
    .send('{"username":"shivani"'); // intentionally broken JSON

  expect(response.status).toBe(400);
});
});
describe("Unknown route", () => {

    beforeAll(async () => {
  await connectProducer();
});
 test("should return health status", async () => {
  const response = await request(app).get("/health");

  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    status: "ok",
  });
});
});

afterAll(async () => {
  await disconnectProducer();
  await pool.end();
});
