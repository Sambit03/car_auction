import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue: any) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return res.status(400).json({
          error: "Validation failed",
          details: errorMessages,
        });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  };
};
