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

// seed helper — creates one invoice and one client
const seedData = async (token: string) => {
  await request(app)
    .post("/api/invoices")
    .set("Authorization", `Bearer ${token}`)
    .send({
      invoiceNo: "INV-001",
      clientName: "Acme Corp",
      clientEmail: "acme@example.com",
      invoiceDate: "2024-01-01",
      items: [{ description: "Web Design", quantity: 2, cost: 500 }],
    });

  await request(app)
    .post("/api/clients")
    .set("Authorization", `Bearer ${token}`)
    .send({
      clientName: "Acme Corp",
      clientEmail: "acme@example.com",
      clientAddress: "123 Main St",
      contactNumber: "1234567890",
    });
};

// ─── SEARCH ───────────────────────────────────────────────────────────────────

describe("GET /api/search", () => {
  it("should return empty arrays when no query is provided", async () => {
    token = await loginUser();

    const res = await request(app)
      .get("/api/search")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ invoices: [], clients: [] });
  });

  it("should find invoices and clients matching the query", async () => {
    token = await loginUser();
    await seedData(token);

    const res = await request(app)
      .get("/api/search?q=Acme")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.invoices.length).toBe(1);
    expect(res.body.clients.length).toBe(1);
    expect(res.body.invoices[0].clientName).toBe("Acme Corp");
    expect(res.body.clients[0].clientName).toBe("Acme Corp");
  });

  it("should be case insensitive", async () => {
    token = await loginUser();
    await seedData(token);

    const res = await request(app)
      .get("/api/search?q=acme") // lowercase
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.invoices.length).toBe(1);
    expect(res.body.clients.length).toBe(1);
  });

  it("should return empty arrays when no match found", async () => {
    token = await loginUser();
    await seedData(token);

    const res = await request(app)
      .get("/api/search?q=NOMATCH")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.invoices).toEqual([]);
    expect(res.body.clients).toEqual([]);
  });

  it("should search by invoice number", async () => {
    token = await loginUser();
    await seedData(token);

    const res = await request(app)
      .get("/api/search?q=INV-001")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.invoices.length).toBe(1);
    expect(res.body.invoices[0].invoiceNo).toBe("INV-001");
  });

  it("should return 401 with no token", async () => {
    const res = await request(app).get("/api/search?q=Acme");
    expect(res.statusCode).toEqual(401);
  });
});
