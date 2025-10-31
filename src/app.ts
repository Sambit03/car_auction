import express, { Request, Response, NextFunction } from "express";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
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

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: "deny",
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests",
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: "Too many authentication attempts",
    message:
      "Too many login attempts from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    error: "Rate limit exceeded",
    message: "Too many requests, please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auction", authLimiter, authRoutes);

app.use("/api", generalLimiter, verifyToken, carRoutes);
app.use("/api", generalLimiter, verifyToken, dealerRoutes);
app.use("/api", generalLimiter, verifyToken, auctionRoutes);
app.use("/api/auctions/:auctionId/bids", strictLimiter);
app.use("/api", generalLimiter, verifyToken, bidRoutes);

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
