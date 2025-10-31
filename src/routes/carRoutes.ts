import { Router, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../app";
import { cars } from "../db/schema";

const router = Router();

router.get("/cars", async (req: Request, res: Response): Promise<void> => {
  try {
    const allCars = await db.select().from(cars);

    res.status(200).json({
      success: true,
      count: allCars.length,
      data: allCars,
    });
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch cars",
    });
  }
});

router.get("/cars/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const carId = parseInt(req.params.id);

    if (isNaN(carId)) {
      res.status(400).json({
        error: "Bad request",
        message: "Invalid car ID",
      });
      return;
    }

    const car = await db
      .select()
      .from(cars)
      .where(eq(cars.carId, carId))
      .limit(1);

    if (car.length === 0) {
      res.status(404).json({
        error: "Not found",
        message: "Car not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: car[0],
    });
  } catch (error) {
    console.error("Error fetching car:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch car",
    });
  }
});

router.post("/cars", async (req: Request, res: Response): Promise<void> => {
  try {
    const { make, model, year } = req.body;

    if (!make || !model || !year) {
      res.status(400).json({
        error: "Bad request",
        message: "Make, model, and year are required",
      });
      return;
    }

    if (typeof year !== "number" || year < 1900 || year > 2100) {
      res.status(400).json({
        error: "Bad request",
        message: "Invalid year",
      });
      return;
    }

    const newCar = await db
      .insert(cars)
      .values({
        make,
        model,
        year,
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Car created successfully",
      data: newCar[0],
    });
  } catch (error) {
    console.error("Error creating car:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create car",
    });
  }
});

router.put("/cars/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const carId = parseInt(req.params.id);

    if (isNaN(carId)) {
      res.status(400).json({
        error: "Bad request",
        message: "Invalid car ID",
      });
      return;
    }

    const { make, model, year } = req.body;

    const existingCar = await db
      .select()
      .from(cars)
      .where(eq(cars.carId, carId))
      .limit(1);

    if (existingCar.length === 0) {
      res.status(404).json({
        error: "Not found",
        message: "Car not found",
      });
      return;
    }

    const updateData: any = {};
    if (make !== undefined) updateData.make = make;
    if (model !== undefined) updateData.model = model;
    if (year !== undefined) {
      if (typeof year !== "number" || year < 1900 || year > 2100) {
        res.status(400).json({
          error: "Bad request",
          message: "Invalid year",
        });
        return;
      }
      updateData.year = year;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        error: "Bad request",
        message: "No fields to update",
      });
      return;
    }

    updateData.updatedAt = new Date();

    const updatedCar = await db
      .update(cars)
      .set(updateData)
      .where(eq(cars.carId, carId))
      .returning();

    res.status(200).json({
      success: true,
      message: "Car updated successfully",
      data: updatedCar[0],
    });
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update car",
    });
  }
});

router.delete(
  "/cars/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const carId = parseInt(req.params.id);

      if (isNaN(carId)) {
        res.status(400).json({
          error: "Bad request",
          message: "Invalid car ID",
        });
        return;
      }

      const existingCar = await db
        .select()
        .from(cars)
        .where(eq(cars.carId, carId))
        .limit(1);

      if (existingCar.length === 0) {
        res.status(404).json({
          error: "Not found",
          message: "Car not found",
        });
        return;
      }

      await db.delete(cars).where(eq(cars.carId, carId));

      res.status(200).json({
        success: true,
        message: "Car deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting car:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to delete car",
      });
    }
  }
);

export default router;
