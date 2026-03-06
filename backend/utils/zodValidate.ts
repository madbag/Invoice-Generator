import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
});
export type CreateClientInput = z.infer<typeof createClientSchema>;

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be at least 0"),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  dueDate: z.string().optional(),
  status: z.enum(["pending", "paid", "overdue"]).default("pending"),
});
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
