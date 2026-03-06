import express from "express";
import { getClients, createClient, deleteClient } from "../controllers/clientController";
import authMiddleware from "../middleware/auth";

const router = express.Router();

router.get("/", authMiddleware, getClients);
router.post("/", authMiddleware, createClient);
router.delete("/:id", authMiddleware, deleteClient);

export default router;