import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Invoice from "../models/Invoice";
import Client from "../models/Client";

export const search = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const query = req.query.q as string;

    if (!query) return res.json({ invoices: [], clients: [] });

    const regex = new RegExp(query, "i");

    const invoices = await Invoice.find({
      userId,
      $or: [
        { invoiceNo: regex },
        { clientName: regex },
        { clientEmail: regex },
        { status: regex },
      ],
    }).limit(5);

    const clients = await Client.find({
      userId,
      $or: [
        { clientName: regex },
        { clientEmail: regex },
        { contactNumber: regex },
        { clientAddress: regex },
      ],
    }).limit(5);

    res.json({ invoices, clients });
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
};
