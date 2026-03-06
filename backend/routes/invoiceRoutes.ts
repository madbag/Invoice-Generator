// routes/invoiceRoutes.ts
import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  deleteInvoice
} from "../controllers/invoiceController";
import authMiddleware from "../middleware/auth"

const router = express.Router();

router.post("/", authMiddleware, createInvoice);
router.get("/",authMiddleware, getInvoices);
router.get("/:id",authMiddleware, getInvoiceById);
router.put("/:id",authMiddleware, updateInvoiceStatus);
router.delete("/:id",authMiddleware, deleteInvoice);

export default router;