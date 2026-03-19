import express from "express";
import { search } from "../controllers/searchController";
import authMiddleware from "../middleware/auth";

const router = express.Router();
router.get("/", authMiddleware, search);
export default router;