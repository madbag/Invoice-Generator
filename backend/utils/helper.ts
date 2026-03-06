//Helper Functions, reusable code across the app
//GENERAL HELPERS - FORMATTING, VALIDATION, ID GENERATION 

// utils/helper.ts
import { ZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware to validate request bodies using Zod schemas
 * @param schema Zod schema to validate against
 */

export const validate = (schema: ZodObject<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Send structured errors
      return res.status(400).json({ errors: result.error.format() });
    }

    // Replace req.body with validated & typed data
    req.body = result.data;
    next();
  };
};