import { Router, Request, Response } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { db } from "../app";
import { dealers, insertDealerSchema } from "../db/schema";
import { validateRequest } from "../middleware/validateRequest";
import { z } from "zod";

const router = Router();
router.get("/dealers", async (req: Request, res: Response): Promise<void> => {
  try {
    const allDealers = await db
      .select({
        dealerId: dealers.dealerId,
        name: dealers.name,
        email: dealers.email,
        createdAt: dealers.createdAt,
        updatedAt: dealers.updatedAt,
      })
      .from(dealers);

    res.status(200).json({
      success: true,
      count: allDealers.length,
      data: allDealers,
    });
  } catch (error) {
    console.error("Error fetching dealers:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch dealers",
    });
  }
});
router.get(
  "/dealers/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const dealerId = parseInt(req.params.id);

      if (isNaN(dealerId)) {
        res.status(400).json({
          error: "Bad request",
          message: "Invalid dealer ID",
        });
        return;
      }

      const dealer = await db
        .select({
          dealerId: dealers.dealerId,
          name: dealers.name,
          email: dealers.email,
          createdAt: dealers.createdAt,
          updatedAt: dealers.updatedAt,
        })
        .from(dealers)
        .where(eq(dealers.dealerId, dealerId))
        .limit(1);

      if (dealer.length === 0) {
        res.status(404).json({
          error: "Not found",
          message: "Dealer not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: dealer[0],
      });
    } catch (error) {
      console.error("Error fetching dealer:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to fetch dealer",
      });
    }
  }
);
const dealerRegisterSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(100),
  password: z.string().min(6),
});

router.post(
  "/dealers/register",
  validateRequest(dealerRegisterSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      const existingDealer = await db
        .select()
        .from(dealers)
        .where(eq(dealers.email, email))
        .limit(1);

      if (existingDealer.length > 0) {
        res.status(400).json({
          error: "Bad request",
          message: "Email already registered",
        });
        return;
      }
      const passwordHash = await bcrypt.hash(password, 10);

      const newDealer = await db
        .insert(dealers)
        .values({
          name,
          email,
          passwordHash,
        })
        .returning({
          dealerId: dealers.dealerId,
          name: dealers.name,
          email: dealers.email,
          createdAt: dealers.createdAt,
        });

      res.status(201).json({
        success: true,
        message: "Dealer registered successfully",
        data: newDealer[0],
      });
    } catch (error) {
      console.error("Error creating dealer:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to register dealer",
      });
    }
  }
);
router.put(
  "/dealers/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const dealerId = parseInt(req.params.id);

      if (isNaN(dealerId)) {
        res.status(400).json({
          error: "Bad request",
          message: "Invalid dealer ID",
        });
        return;
      }

      const { name, email, password } = req.body;
      const existingDealer = await db
        .select()
        .from(dealers)
        .where(eq(dealers.dealerId, dealerId))
        .limit(1);

      if (existingDealer.length === 0) {
        res.status(404).json({
          error: "Not found",
          message: "Dealer not found",
        });
        return;
      }
      const updateData: any = {};

      if (name !== undefined) updateData.name = name;

      if (email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          res.status(400).json({
            error: "Bad request",
            message: "Invalid email format",
          });
          return;
        }
        const emailCheck = await db
          .select()
          .from(dealers)
          .where(eq(dealers.email, email))
          .limit(1);

        if (emailCheck.length > 0 && emailCheck[0].dealerId !== dealerId) {
          res.status(400).json({
            error: "Bad request",
            message: "Email already in use",
          });
          return;
        }

        updateData.email = email;
      }

      if (password !== undefined) {
        updateData.passwordHash = await bcrypt.hash(password, 10);
      }

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          error: "Bad request",
          message: "No fields to update",
        });
        return;
      }

      updateData.updatedAt = new Date();

      const updatedDealer = await db
        .update(dealers)
        .set(updateData)
        .where(eq(dealers.dealerId, dealerId))
        .returning({
          dealerId: dealers.dealerId,
          name: dealers.name,
          email: dealers.email,
          updatedAt: dealers.updatedAt,
        });

      res.status(200).json({
        success: true,
        message: "Dealer updated successfully",
        data: updatedDealer[0],
      });
    } catch (error) {
      console.error("Error updating dealer:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to update dealer",
      });
    }
  }
);
router.delete(
  "/dealers/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const dealerId = parseInt(req.params.id);

      if (isNaN(dealerId)) {
        res.status(400).json({
          error: "Bad request",
          message: "Invalid dealer ID",
        });
        return;
      }
      const existingDealer = await db
        .select()
        .from(dealers)
        .where(eq(dealers.dealerId, dealerId))
        .limit(1);

      if (existingDealer.length === 0) {
        res.status(404).json({
          error: "Not found",
          message: "Dealer not found",
        });
        return;
      }

      await db.delete(dealers).where(eq(dealers.dealerId, dealerId));

      res.status(200).json({
        success: true,
        message: "Dealer deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting dealer:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to delete dealer",
      });
    }
  }
);

export default router;
