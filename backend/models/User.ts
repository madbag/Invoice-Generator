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
    profilePicture: { type: String, default: null },
    businessDetails: {
      businessName: String,
      contact: String,
      instagram: String,
      facebook: String,
      website: String,
      other: String,
      currency: { type: String, enum: ["EUR", "INR", "USD"] },
    },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpiry: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("User", UserSchema);
