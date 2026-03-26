// Database structure
// USER SCHEMA - BASIC INFO, BUSINESS DETAILS

import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    businessDetails: {
      address: String,
      contact: String,
    },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpiry: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("User", UserSchema);
