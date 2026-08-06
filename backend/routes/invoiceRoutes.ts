// routes/invoiceRoutes.ts
import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  deleteInvoice,
  sendInvoice,
  sendGuestInvoice,
  downloadInvoicePdf,
} from "../controllers/invoiceController";
import authMiddleware from "../middleware/auth";

const router = express.Router();

// Guest, one-time send — no auth, nothing is persisted
router.post("/guest-send", sendGuestInvoice);

// PDF download — no auth, works off draft form data before it's saved
router.post("/pdf", downloadInvoicePdf);

router.post("/", authMiddleware, createInvoice);
router.get("/", authMiddleware, getInvoices);
router.get("/:id", authMiddleware, getInvoiceById);
router.put("/:id", authMiddleware, updateInvoiceStatus);
router.delete("/:id", authMiddleware, deleteInvoice);

router.post("/:id/send", authMiddleware, sendInvoice);

export default router;
