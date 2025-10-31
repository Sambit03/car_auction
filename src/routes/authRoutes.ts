import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
router.post("/token", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        error: "Bad request",
        message: "Username and password are required",
      });
      return;
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid credentials",
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({
        error: "Internal server error",
        message: "JWT_SECRET is not configured",
      });
      return;
    }

    const token = jwt.sign({ username: ADMIN_USERNAME }, jwtSecret, {
      expiresIn: "24h",
    });

    res.status(200).json({
      token,
    });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to generate token",
    });
  }
});

export default router;
