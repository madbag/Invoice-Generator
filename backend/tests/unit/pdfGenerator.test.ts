import { PDFGenerator } from "../../utils/pdfGenerator";

const sampleInvoice = {
  invoiceNo: "INV-001",
  clientName: "Acme Corp",
  clientEmail: "acme@example.com",
  invoiceDate: "2024-01-01",
  total: 1000,
  items: [{ description: "Web Design", quantity: 2, cost: 500 }],
};

describe("PDFGenerator", () => {
  it("should return a Buffer", async () => {
    const result = await PDFGenerator(sampleInvoice);
    expect(result).toBeInstanceOf(Buffer);
  });

  it("should return a non-empty buffer", async () => {
    const result = await PDFGenerator(sampleInvoice);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should reject when items are missing", async () => {
    const badInvoice = { ...sampleInvoice, items: null };
    await expect(PDFGenerator(badInvoice)).rejects.toThrow();
  });
});