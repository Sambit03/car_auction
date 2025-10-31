import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    username: string;
  };
}

export function verifyToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Unauthorized",
        message: "No token provided or invalid format",
      });
      return;
    }

    const token = authHeader.substring(7);

    const jwtSecret = process.env.JWT_SECRET || "secretkey";

    const decoded = jwt.verify(token, jwtSecret) as { username: string };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid token",
      });
      return;
    }

    res.status(500).json({
      error: "Internal server error",
      message: "Error verifying token",
    });
  }
}
