import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Client from "../models/Client";
import Invoice from "../models/Invoice";

export const getClients = async (req: AuthRequest, res: Response) => {
  try {
    const clients = await Client.find({ userId: req.user?._id });
    
    // Attach invoice count and total billed per client
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        const invoices = await Invoice.find({ 
          clientEmail: client.clientEmail, 
          userId: req.user?._id 
        });
        const totalBilled = invoices.reduce((sum, inv) => sum + inv.total, 0);
        return { ...client.toObject(), invoiceCount: invoices.length, totalBilled };
      })
    );

    res.json(clientsWithStats);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const { clientName, clientEmail, clientAddress, contactNumber } = req.body;
    const userId = req.user?._id;

    // Avoid duplicates by email per user
    const existing = await Client.findOne({ clientEmail, userId });
    if (existing) return res.status(200).json(existing); // return existing, not error

    const client = new Client({ clientName, clientEmail, clientAddress, contactNumber, userId });
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: "Failed to save client" });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: "Client deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};