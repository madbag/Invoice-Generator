import { sendInvoiceEmail } from "../../utils/resentEmail";
const mockSend = jest.fn().mockResolvedValue({ id: "mocked-email-id" });

// mock Resend so no real emails are sent
jest.mock("resend", () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: mockSend,
      },
    })),
  };
});

// mock PDFGenerator so no real PDF is generated
jest.mock("../../utils/pdfGenerator", () => ({
  PDFGenerator: jest.fn().mockResolvedValue(Buffer.from("mock-pdf")),
}));

const sampleInvoice = {
  invoiceNo: "INV-001",
  clientName: "Acme Corp",
  clientEmail: "acme@example.com",
  invoiceDate: "2024-01-01",
  total: 1000,
  items: [{ description: "Web Design", quantity: 2, cost: 500 }],
};

describe("sendInvoiceEmail", () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = "test-api-key";
  });

  it("should call PDFGenerator with the invoice", async () => {
    const { PDFGenerator } = require("../../utils/pdfGenerator");
    await sendInvoiceEmail(sampleInvoice);
    expect(PDFGenerator).toHaveBeenCalledWith(sampleInvoice);
  });

  it("should call resend.emails.send with correct fields", async () => {
    // const { Resend } = require("resend");
    await sendInvoiceEmail(sampleInvoice);

    // const mockSend = Resend.mock.instances[0].emails.send;
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "acme@example.com",
        subject: expect.stringContaining("INV-001"),
        attachments: expect.arrayContaining([
          expect.objectContaining({ filename: "INV-001.pdf" }),
        ]),
      })
    );
  });

  it("should throw if PDFGenerator fails", async () => {
    const { PDFGenerator } = require("../../utils/pdfGenerator");
    PDFGenerator.mockRejectedValueOnce(new Error("PDF failed"));
    await expect(sendInvoiceEmail(sampleInvoice)).rejects.toThrow("PDF failed");
  });
});