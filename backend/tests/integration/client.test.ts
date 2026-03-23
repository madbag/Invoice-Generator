import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../../app";

process.env.JWT_SECRET = "test_secret";

let mongo: MongoMemoryServer;
let token: string;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  token = "";
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

// helper — register + login to get a token
const loginUser = async () => {
  await request(app).post("/api/auth/register").send({
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    password: "password123",
  });
  const res = await request(app).post("/api/auth/login").send({
    email: "test@example.com",
    password: "password123",
  });
  return res.body.token;
};

// ─── GET CLIENTS ──────────────────────────────────────────────────────────────

describe("GET /api/clients", () => {
  it("should return empty array when no clients exist", async () => {
    token = await loginUser();
    const res = await request(app)
      .get("/api/clients")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([]);
  });

  it("should return clients for authenticated user", async () => {
    token = await loginUser();

    // create a client first
    await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clientName: "Acme Corp",
        clientEmail: "acme@example.com",
        clientAddress: "123 Main St",
        contactNumber: "1234567890",
      });

    const res = await request(app)
      .get("/api/clients")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].clientName).toBe("Acme Corp");
    expect(res.body[0]).toHaveProperty("invoiceCount");
    expect(res.body[0]).toHaveProperty("totalBilled");
  });

  it("should return 401 with no token", async () => {
    const res = await request(app).get("/api/clients");
    expect(res.statusCode).toEqual(401);
  });
});

// ─── CREATE CLIENT ────────────────────────────────────────────────────────────

describe("POST /api/clients", () => {
  it("should create a new client", async () => {
    token = await loginUser();

    const res = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clientName: "Acme Corp",
        clientEmail: "acme@example.com",
        clientAddress: "123 Main St",
        contactNumber: "1234567890",
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.clientName).toBe("Acme Corp");
    expect(res.body.clientEmail).toBe("acme@example.com");
  });

  it("should return existing client instead of error on duplicate email", async () => {
    token = await loginUser();

    await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clientName: "Acme Corp",
        clientEmail: "acme@example.com",
        clientAddress: "123 Main St",
        contactNumber: "1234567890",
      });

    // send again with same email
    const res = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clientName: "Acme Corp",
        clientEmail: "acme@example.com",
        clientAddress: "123 Main St",
        contactNumber: "1234567890",
      });

    expect(res.statusCode).toEqual(200); // returns existing, not 201
    expect(res.body.clientEmail).toBe("acme@example.com");
  });

  it("should return 401 with no token", async () => {
    const res = await request(app).post("/api/clients").send({
      clientName: "Acme Corp",
      clientEmail: "acme@example.com",
    });
    expect(res.statusCode).toEqual(401);
  });
});

// ─── DELETE CLIENT ────────────────────────────────────────────────────────────

describe("DELETE /api/clients/:id", () => {
  it("should delete a client", async () => {
    token = await loginUser();

    // create client first
    const created = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clientName: "Acme Corp",
        clientEmail: "acme@example.com",
        clientAddress: "123 Main St",
        contactNumber: "1234567890",
      });

    const clientId = created.body._id;

    const res = await request(app)
      .delete(`/api/clients/${clientId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe("Client deleted");
  });

  it("should return 401 with no token", async () => {
    const res = await request(app).delete("/api/clients/someid");
    expect(res.statusCode).toEqual(401);
  });
});
