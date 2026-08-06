//Handles API request and responses
//CRUD OPERATIONS FOR INVOICES

// controllers/invoiceController.ts
import { Request, Response } from "express";
import Invoice from "../models/Invoice";
import { AuthRequest } from "../middleware/auth";
import { sendInvoiceEmail } from "../utils/resentEmail";
import { PDFGenerator } from "../utils/pdfGenerator";

// CREATE INVOICE
export const createInvoice = async (req: AuthRequest, res: Response,) => {
  // console.log("BODY:", req.body);
  console.log("USER ID:", req.user?._id);
  
  try {
    const userId = req.user?._id;
    const {
      invoiceNo,
      clientName,
      clientEmail,
      clientAddress,
      contactNumber,
      invoiceDate,
      items,
    } = req.body;

    if (
      !invoiceNo ||
      !clientName ||
      !clientEmail ||
      !clientAddress ||
      !contactNumber ||
      !invoiceDate ||
      !items
    ) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Calculate total
    const total = items.reduce(
      (sum: number, item: { quantity: number; cost: number }) =>
        sum + item.quantity * item.cost,
      0,
    );

    const invoice = new Invoice({
      invoiceNo,
      clientName,
      clientEmail,
      clientAddress,
      contactNumber,
      invoiceDate,
      items,
      total,
      status: "pending", // default
      userId,
    });

    await invoice.save();

    res.status(201).json(invoice);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to save invoice" });
  }
};

// GET ALL INVOICES
export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const invoices = await Invoice.find({ userId }).sort({ createdAt: -1 }); // latest first
    res.json(invoices);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};

// GET SINGLE INVOICE
export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found." });
    res.json(invoice);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};

// UPDATE INVOICE STATUS
export const updateInvoiceStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // pending / paid / overdue

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!invoice) return res.status(404).json({ error: "Invoice not found." });

    res.json(invoice);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};

// DELETE INVOICE
export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByIdAndDelete(id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found." });
    res.json({ message: "Invoice deleted successfully." });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};

// SEND INVOICE FOR A GUEST (ONE-TIME, NO AUTH) — emails the invoice without saving anything
export const sendGuestInvoice = async (req: Request, res: Response) => {
  try {
    const {
      invoiceNo,
      clientName,
      clientEmail,
      clientAddress,
      contactNumber,
      invoiceDate,
      items,
    } = req.body;

    if (
      !invoiceNo ||
      !clientName ||
      !clientEmail ||
      !clientAddress ||
      !contactNumber ||
      !items
    ) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const total = items.reduce(
      (sum: number, item: { quantity: number; cost: number }) =>
        sum + item.quantity * item.cost,
      0,
    );

    await sendInvoiceEmail({
      invoiceNo,
      clientName,
      clientEmail,
      clientAddress,
      contactNumber,
      invoiceDate,
      items,
      total,
    });

    res.json({ message: "Invoice sent successfully" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to send invoice" });
  }
};

// GENERATE INVOICE PDF FOR DOWNLOAD — no auth, works off the draft form data
// directly so it's available before (and after) the invoice is saved.
export const downloadInvoicePdf = async (req: Request, res: Response) => {
  try {
    const {
      invoiceNo,
      clientName,
      clientEmail,
      clientAddress,
      contactNumber,
      invoiceDate,
      items,
    } = req.body;

    if (
      !invoiceNo ||
      !clientName ||
      !clientEmail ||
      !clientAddress ||
      !contactNumber ||
      !invoiceDate ||
      !items
    ) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const total = items.reduce(
      (sum: number, item: { quantity: number; cost: number }) =>
        sum + item.quantity * item.cost,
      0,
    );

    const pdfBuffer = await PDFGenerator({
      invoiceNo,
      clientName,
      clientEmail,
      clientAddress,
      contactNumber,
      invoiceDate,
      items,
      total,
    });

    const safeName =
      String(invoiceNo).replace(/[^a-zA-Z0-9-_]/g, "_") || "invoice";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeName}.pdf"`,
    );
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};

export const sendInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    await sendInvoiceEmail(invoice);
    res.json({ message: "Invoice sent successfully" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to send invoice" });
  }
};