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

// helper — create a sample invoice
const sampleInvoice = {
  invoiceNo: "INV-001",
  clientName: "Acme Corp",
  clientEmail: "acme@example.com",
  invoiceDate: "2024-01-01",
  items: [{ description: "Web Design", quantity: 2, cost: 500 }],
};

// ─── CREATE INVOICE ───────────────────────────────────────────────────────────

describe("POST /api/invoices", () => {
  it("should create an invoice and calculate total", async () => {
    token = await loginUser();

    const res = await request(app)
      .post("/api/invoices")
      .set("Authorization", `Bearer ${token}`)
      .send(sampleInvoice);

    expect(res.statusCode).toEqual(201);
    expect(res.body.invoiceNo).toBe("INV-001");
    expect(res.body.total).toBe(1000); // 2 * 500
    expect(res.body.status).toBe("pending");
  });

  it("should return 400 if required fields are missing", async () => {
    token = await loginUser();

    const res = await request(app)
      .post("/api/invoices")
      .set("Authorization", `Bearer ${token}`)
      .send({ invoiceNo: "INV-001" }); // missing fields

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe("Missing required fields.");
  });

  it("should return 401 with no token", async () => {
    const res = await request(app).post("/api/invoices").send(sampleInvoice);
    expect(res.statusCode).toEqual(401);
  });
});

// ─── GET ALL INVOICES ─────────────────────────────────────────────────────────

describe("GET /api/invoices", () => {
  it("should return empty array when no invoices exist", async () => {
    token = await loginUser();

    const res = await request(app)
      .get("/api/invoices")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([]);
  });

  it("should return invoices for authenticated user", async () => {
    token = await loginUser();

    await request(app)
      .post("/api/invoices")
      .set("Authorization", `Bearer ${token}`)
      .send(sampleInvoice);

    const res = await request(app)
      .get("/api/invoices")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].invoiceNo).toBe("INV-001");
  });

  it("should return 401 with no token", async () => {
    const res = await request(app).get("/api/invoices");
    expect(res.statusCode).toEqual(401);
  });
});

// ─── GET SINGLE INVOICE ───────────────────────────────────────────────────────

describe("GET /api/invoices/:id", () => {
  it("should return a single invoice by id", async () => {
    token = await loginUser();

    const created = await request(app)
      .post("/api/invoices")
      .set("Authorization", `Bearer ${token}`)
      .send(sampleInvoice);

    const invoiceId = created.body._id;

    const res = await request(app)
      .get(`/api/invoices/${invoiceId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body._id).toBe(invoiceId);
    expect(res.body.invoiceNo).toBe("INV-001");
  });

  it("should return 404 for non-existent invoice", async () => {
    token = await loginUser();
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/invoices/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body.error).toBe("Invoice not found.");
  });
});

// ─── UPDATE INVOICE STATUS ────────────────────────────────────────────────────

describe("PUT /api/invoices/:id", () => {
  it("should update invoice status to paid", async () => {
    token = await loginUser();

    const created = await request(app)
      .post("/api/invoices")
      .set("Authorization", `Bearer ${token}`)
      .send(sampleInvoice);

    const invoiceId = created.body._id;

    const res = await request(app)
      .put(`/api/invoices/${invoiceId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "paid" });

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe("paid");
  });

  it("should return 404 for non-existent invoice", async () => {
    token = await loginUser();
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/invoices/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "paid" });

    expect(res.statusCode).toEqual(404);
  });
});

// ─── DELETE INVOICE ───────────────────────────────────────────────────────────

describe("DELETE /api/invoices/:id", () => {
  it("should delete an invoice", async () => {
    token = await loginUser();

    const created = await request(app)
      .post("/api/invoices")
      .set("Authorization", `Bearer ${token}`)
      .send(sampleInvoice);

    const invoiceId = created.body._id;

    const res = await request(app)
      .delete(`/api/invoices/${invoiceId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe("Invoice deleted successfully.");
  });

  it("should return 404 for non-existent invoice", async () => {
    token = await loginUser();
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/invoices/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
  });

  it("should return 401 with no token", async () => {
    const res = await request(app).delete("/api/invoices/someid");
    expect(res.statusCode).toEqual(401);
  });
});
