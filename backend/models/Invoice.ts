import mongoose, { Schema } from "mongoose";

const InvoiceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    items: [
      {
        description: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Paid", "Draft", "Overdue", "Sent"],
      default: "Draft",
    },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("Invoice", InvoiceSchema);
