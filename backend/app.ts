import express, { Application, Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import invoiceRoutes from "./routes/invoiceRoutes";
import clientRoutes from "./routes/clientRoutes";
import searchRoutes from "./routes/searchRoutes";
import { errorHandler } from "./middleware/errorMiddleware";

export const app: Application = express();

app.use(cors());
// tells express to turn the body into a json object
app.use(express.json());

// simple route testing
app.get("/", (req: Request, res: Response) => {
  res.send("Invoice Page is running!");
});

//routes
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/search", searchRoutes);

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(errorHandler);
