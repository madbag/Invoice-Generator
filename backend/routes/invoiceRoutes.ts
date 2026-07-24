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
} from "../controllers/invoiceController";
import authMiddleware from "../middleware/auth";

const router = express.Router();

// Guest, one-time send — no auth, nothing is persisted
router.post("/guest-send", sendGuestInvoice);

router.post("/", authMiddleware, createInvoice);
router.get("/", authMiddleware, getInvoices);
router.get("/:id", authMiddleware, getInvoiceById);
router.put("/:id", authMiddleware, updateInvoiceStatus);
router.delete("/:id", authMiddleware, deleteInvoice);

router.post("/:id/send", authMiddleware, sendInvoice);

export default router;
