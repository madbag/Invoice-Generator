import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../../app";

process.env.JWT_SECRET = "test_secret";

let mongo: MongoMemoryServer;
let token: string; // reused across protected route tests

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  // wipe DB between tests so they don't bleed into each other
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  token = ""; // reset token
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

// ─── REGISTER ────────────────────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  it("should register a new user and return a token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.result.email).toBe("test@example.com");
  });

  it("should return 400 if user already exists", async () => {
    // register once
    await request(app).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "password123",
    });

    // register again with same email
    const res = await request(app).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe("User already exists");
  });
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    // create a user before each login test
    await request(app).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "password123",
    });
  });

  it("should login and return a token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  });

  it("should return 400 for wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("should return 404 for non-existent user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe("User doesn't exist");
  });
});

// Each test registers + logs in to get a fresh token

describe("GET /api/auth/profile", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "password123",
    });
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });
    token = loginRes.body.token;
  });

  it("should return profile for authenticated user", async () => {
    const res = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.email).toBe("test@example.com");
    expect(res.body.firstName).toBe("Test");
  });

  it("should return 401 with no token", async () => {
    const res = await request(app).get("/api/auth/profile");

    expect(res.statusCode).toEqual(401);
  });
});

describe("PUT /api/auth/profile", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "password123",
    });
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });
    token = loginRes.body.token;
  });

  it("should update profile for authenticated user", async () => {
    const res = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "Updated",
        lastName: "Name",
        email: "test@example.com",
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.firstName).toBe("Updated");
  });
});

describe("DELETE /api/auth/profile", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "password123",
    });
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });
    token = loginRes.body.token;
  });

  it("should delete authenticated user", async () => {
    const res = await request(app)
      .delete("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe("User deleted successfully");
  });

  it("should return 401 after user is deleted and tries to access profile", async () => {
    // delete the user
    await request(app)
      .delete("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`);

    // try to access profile with the old token
    const res = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
  });
});
