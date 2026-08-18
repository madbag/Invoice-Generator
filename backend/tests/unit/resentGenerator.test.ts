import { sendInvoiceEmail } from "../../utils/resentEmail";
const mockSendMail = jest.fn().mockResolvedValue({ messageId: "mocked-email-id" });

// mock nodemailer so no real emails are sent
jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockImplementation(() => ({
    sendMail: mockSendMail,
  })),
}));

// mock dns so resolving smtp.gmail.com's IPv4 address doesn't hit the network
jest.mock("dns", () => ({
  promises: {
    resolve4: jest.fn().mockResolvedValue(["142.250.1.109"]),
  },
}));

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
    process.env.GMAIL_USER = "test@gmail.com";
    process.env.GMAIL_APP_PASSWORD = "test-app-password";
    mockSendMail.mockClear();
  });

  it("should call PDFGenerator with the invoice", async () => {
    const { PDFGenerator } = require("../../utils/pdfGenerator");
    await sendInvoiceEmail(sampleInvoice);
    expect(PDFGenerator).toHaveBeenCalledWith(sampleInvoice);
  });

  it("should call transporter.sendMail with correct fields", async () => {
    await sendInvoiceEmail(sampleInvoice);

    expect(mockSendMail).toHaveBeenCalledWith(
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
