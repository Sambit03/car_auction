import express, { Request, Response, NextFunction } from "express";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });
export { db };

import authRoutes from "./routes/authRoutes";
import carRoutes from "./routes/carRoutes";
import dealerRoutes from "./routes/dealerRoutes";
import auctionRoutes from "./routes/auctionRoutes";
import bidRoutes from "./routes/bidRoutes";

import { verifyToken } from "./middleware/verifyToken";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auction", authRoutes);

app.use("/api", verifyToken, carRoutes);
app.use("/api", verifyToken, dealerRoutes);
app.use("/api", verifyToken, auctionRoutes);
app.use("/api", verifyToken, bidRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not found",
    message: "The requested resource was not found",
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message || "An unexpected error occurred",
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(` Car Auction API Server is running on port ${port}`);
  });
}

export default app;
