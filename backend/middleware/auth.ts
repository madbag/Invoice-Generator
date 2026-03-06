// Runs before controllers for security/validation
// JWT TOKEN CHECK/ ROLE-BASED ACCESS CONTROL

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import User from "../models/User";


// the ? mark means the property as optional/possibly undefined for code safety
export interface AuthRequest extends Request {
  user?: any;
}

const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    //get the token from the header
    // the ?. ensures that the authorization wont crash if the header is missing.
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    //verify the token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    //attach the user Id to the request object 
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user; // attach full user object

    //move to next function
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};



export default auth;