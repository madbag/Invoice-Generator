import mongoose, { Schema } from "mongoose";

const ClientSchema = new Schema(
  {
    //not all the freelancers can access the client details.
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    address: String,
    contact: String,
    totalBilled: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Client", ClientSchema);
