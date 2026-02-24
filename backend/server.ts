import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes";

// loading env variables
dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI || "";

// Middleware
// CORS allows frontend to access resources from backend
app.use(cors());
// tells express to turn the body into a json object
app.use(express.json());

//database connection
mongoose
  .connect(MONGO)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

// simple route testing
app.get("/", (req: Request, res: Response) => {
  res.send("Invoice Page is running!");
});

//routes
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
