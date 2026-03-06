// Database structure
// CLIENT SCHEMA

import mongoose, { Schema } from "mongoose";

const ClientSchema = new Schema(
  {
    //not all the freelancers can access the client details.
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    clientName: { type: String, required: true, trim: true },
    clientEmail: { type: String, required: true, trim: true, lowercase: true },
    clientAddress: String,
    contactNumber: String,
    // invoices: [{ type: Schema.Types.ObjectId, ref: "Invoice" }],
  },
  { timestamps: true },
);

export default mongoose.model("Client", ClientSchema);
