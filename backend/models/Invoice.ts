import { Schema, model } from "mongoose";

const invoiceSchema = new Schema(
  {
    invoiceNo: { type: String, required: true },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    invoiceDate: { type: String, required: true },
    items: { type: Array, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export default model("Invoice", invoiceSchema);
