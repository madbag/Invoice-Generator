//Handles API request and responses
// LOGIN, REGISTER, PASSWORD HASHING, TOKEN GENERATION

import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/auth";
import { sendPasswordResetEmail } from "../utils/resentEmail";
import crypto from "crypto";

//REGISTER FUNCTION
export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    //if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    //if no, then hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    //create a user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    console.log(
      `User ${newUser.firstName} ${newUser.lastName} saved successfully with id ${newUser._id}`,
    );
    // res.status(201).json({  });

    //create a token so they stay logged in even tho the page is refreshed
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      result: newUser,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Cannot register the user" });
  }
};

//LOGIN FUNCTION
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    //check if the user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    //check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //create a token so they stay logged in even tho the page is refreshed
    const token = jwt.sign(
      { id: existingUser._id, email: existingUser.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" },
    );

    res.status(200).json({ result: existingUser, token });
  } catch (err) {
    res.status(500).json({ message: "Cannot log in the user" });
  }
};

// GET PROFILE
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, email, password, businessDetails } = req.body;
    const updates: any = { firstName, lastName, email, businessDetails };

    // Only hash + update password if the user actually typed one
    if (password && password.trim() !== "") {
      updates.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, email },
      { new: true },
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Profile update failed" });
  }
};

// DELETE PROFILE
export const deleteProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return the same message (prevents email enumeration)
    const genericResponse = {
      message:
        "If an account exists with this email, you will receive reset instructions.",
    };

    if (!user) {
      console.log("No user found for email:", email);
      return res.status(200).json(genericResponse);
    }

    // Generate a plain random token (not JWT — easier to invalidate)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save token + expiry to the user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = expiry;
    await user.save();

    console.log("Sending reset email to:", email);
    await sendPasswordResetEmail(email, resetToken);
    console.log("Email sent successfully");

    res.status(200).json(genericResponse);
  } catch (error) {
    console.error("Forgot password full error:", error);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
};

// RESET PASSWORD — verify token and set new password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    // Find user with this token and check it hasn't expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() }, // must still be in the future
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset link." });
    }

    // Hash new password and clear the token
    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    res
      .status(200)
      .json({ message: "Password reset successfully. You can now sign in." });
  } catch (error) {
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
};
