//Handles API request and responses
//CRUD OPERATIONS FOR INVOICES

import { AuthRequest } from "../middleware/auth";
import { Response } from "express";
import Invoice from "../models/Invoice";
import mongoose from "mongoose";

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await Invoice.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$totalAmount", 0] },
          },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ["$status", "Sent"] }, "$totalAmount", 0] },
          },
          invoiceCount: { $sum: 1 },
        },
      },
    ]);
    res
      .status(200)
      .json(stats[0] || { totalRevenue: 0, pendingAmount: 0, invoiceCount: 0 });
  } catch (err) {
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};
