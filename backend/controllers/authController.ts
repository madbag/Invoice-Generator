//Handles API request and responses
// LOGIN, REGISTER, PASSWORD HASHING, TOKEN GENERATION

import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";


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
    console.log(`User ${newUser.firstName} ${newUser.lastName} saved successfully with id ${newUser._id}`);
    // res.status(201).json({  });

    //create a token so they stay logged in even tho the page is refreshed
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    res.status(201).json({ message: "User registered successfully",result: newUser, token });
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
