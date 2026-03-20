import dotenv from "dotenv";
import mongoose from "mongoose";
import { app } from "./app";

// loading env variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI || "";

//database connection
mongoose
  .connect(MONGO)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.log("MongoDB connection error:", err));
