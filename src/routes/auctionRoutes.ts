import { Router, Request, Response } from "express";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { db } from "../app";
import {
  auctions,
  cars,
  bids,
  dealers,
  insertAuctionSchema,
} from "../db/schema";
import { validateRequest } from "../middleware/validateRequest";
import { z } from "zod";

const router = Router();
router.get("/auctions", async (req: Request, res: Response): Promise<void> => {
  try {
    const allAuctions = await db
      .select({
        auctionId: auctions.auctionId,
        carId: auctions.carId,
        carMake: cars.make,
        carModel: cars.model,
        carYear: cars.year,
        status: auctions.status,
        startingPrice: auctions.startingPrice,
        currentHighestBid: auctions.currentHighestBid,
        startTime: auctions.startTime,
        endTime: auctions.endTime,
        createdAt: auctions.createdAt,
      })
      .from(auctions)
      .leftJoin(cars, eq(auctions.carId, cars.carId))
      .orderBy(desc(auctions.createdAt));

    res.status(200).json({
      success: true,
      count: allAuctions.length,
      data: allAuctions,
    });
  } catch (error) {
    console.error("Error fetching auctions:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch auctions",
    });
  }
});
router.get(
  "/auctions/active",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const now = new Date();

      const activeAuctions = await db
        .select({
          auctionId: auctions.auctionId,
          carId: auctions.carId,
          carMake: cars.make,
          carModel: cars.model,
          carYear: cars.year,
          status: auctions.status,
          startingPrice: auctions.startingPrice,
          currentHighestBid: auctions.currentHighestBid,
          startTime: auctions.startTime,
          endTime: auctions.endTime,
        })
        .from(auctions)
        .leftJoin(cars, eq(auctions.carId, cars.carId))
        .where(
          and(
            eq(auctions.status, "LIVE"),
            lte(auctions.startTime, now),
            gte(auctions.endTime, now)
          )
        );

      res.status(200).json({
        success: true,
        count: activeAuctions.length,
        data: activeAuctions,
      });
    } catch (error) {
      console.error("Error fetching active auctions:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to fetch active auctions",
      });
    }
  }
);
router.get(
  "/auctions/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const auctionId = parseInt(req.params.id);

      if (isNaN(auctionId)) {
        res.status(400).json({
          error: "Bad request",
          message: "Invalid auction ID",
        });
        return;
      }
      const auction = await db
        .select({
          auctionId: auctions.auctionId,
          carId: auctions.carId,
          car: {
            carId: cars.carId,
            make: cars.make,
            model: cars.model,
            year: cars.year,
          },
          status: auctions.status,
          startingPrice: auctions.startingPrice,
          currentHighestBid: auctions.currentHighestBid,
          startTime: auctions.startTime,
          endTime: auctions.endTime,
          winnerBidId: auctions.winnerBidId,
          createdAt: auctions.createdAt,
        })
        .from(auctions)
        .leftJoin(cars, eq(auctions.carId, cars.carId))
        .where(eq(auctions.auctionId, auctionId))
        .limit(1);

      if (auction.length === 0) {
        res.status(404).json({
          error: "Not found",
          message: "Auction not found",
        });
        return;
      }
      const auctionBids = await db
        .select({
          bidId: bids.bidId,
          dealerId: bids.dealerId,
          dealerName: dealers.name,
          bidAmount: bids.bidAmount,
          timePlaced: bids.timePlaced,
        })
        .from(bids)
        .leftJoin(dealers, eq(bids.dealerId, dealers.dealerId))
        .where(eq(bids.auctionId, auctionId))
        .orderBy(desc(bids.bidAmount));

      res.status(200).json({
        success: true,
        data: {
          ...auction[0],
          bids: auctionBids,
        },
      });
    } catch (error) {
      console.error("Error fetching auction:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to fetch auction",
      });
    }
  }
);
router.get(
  "/auctions/:id/highest-bid",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const auctionId = parseInt(req.params.id);

      if (isNaN(auctionId)) {
        res.status(400).json({
          error: "Bad request",
          message: "Invalid auction ID",
        });
        return;
      }

      const highestBid = await db
        .select({
          bidId: bids.bidId,
          dealerId: bids.dealerId,
          dealerName: dealers.name,
          bidAmount: bids.bidAmount,
          timePlaced: bids.timePlaced,
        })
        .from(bids)
        .leftJoin(dealers, eq(bids.dealerId, dealers.dealerId))
        .where(eq(bids.auctionId, auctionId))
        .orderBy(desc(bids.bidAmount))
        .limit(1);

      if (highestBid.length === 0) {
        res.status(404).json({
          error: "Not found",
          message: "No bids found for this auction",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: highestBid[0],
      });
    } catch (error) {
      console.error("Error fetching highest bid:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to fetch highest bid",
      });
    }
  }
);
router.get(
  "/auctions/:id/winner",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const auctionId = parseInt(req.params.id);

      if (isNaN(auctionId)) {
        res.status(400).json({
          error: "Bad request",
          message: "Invalid auction ID",
        });
        return;
      }

      const auction = await db
        .select()
        .from(auctions)
        .where(eq(auctions.auctionId, auctionId))
        .limit(1);

      if (auction.length === 0) {
        res.status(404).json({
          error: "Not found",
          message: "Auction not found",
        });
        return;
      }

      if (auction[0].status !== "ENDED" && auction[0].status !== "CLOSED") {
        res.status(400).json({
          error: "Bad request",
          message: "Auction is not closed yet",
        });
        return;
      }

      if (!auction[0].winnerBidId) {
        res.status(404).json({
          error: "Not found",
          message: "No winner determined for this auction",
        });
        return;
      }

      const winningBid = await db
        .select({
          bidId: bids.bidId,
          dealerId: bids.dealerId,
          dealerName: dealers.name,
          dealerEmail: dealers.email,
          bidAmount: bids.bidAmount,
          timePlaced: bids.timePlaced,
        })
        .from(bids)
        .leftJoin(dealers, eq(bids.dealerId, dealers.dealerId))
        .where(eq(bids.bidId, auction[0].winnerBidId))
        .limit(1);

      res.status(200).json({
        success: true,
        data: {
          auctionId: auction[0].auctionId,
          winner: winningBid[0],
        },
      });
    } catch (error) {
      console.error("Error fetching winner:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to fetch winner",
      });
    }
  }
);
router.post(
  "/auctions",
  validateRequest(insertAuctionSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { carId, startTime, startingPrice, endTime, createdBy } = req.body;

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

      const start = new Date(startTime);
      const end = endTime ? new Date(endTime) : null;

      if (end && end <= start) {
        res.status(400).json({
          error: "Bad request",
          message: "End time must be after start time",
        });
        return;
      }

      const auctionData: any = {
        carId,
        startTime: start,
        startingPrice: startingPrice.toString(),
        status: "DRAFT",
      };

      if (end) {
        auctionData.endTime = end;
      }

      if (createdBy) {
        auctionData.createdBy = createdBy;
      }

      const newAuction = await db
        .insert(auctions)
        .values(auctionData)
        .returning();

      res.status(201).json({
        success: true,
        message: "Auction created successfully",
        data: newAuction[0],
      });
    } catch (error) {
      console.error("Error creating auction:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to create auction",
      });
    }
  }
);
router.put(
  "/auctions/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const auctionId = parseInt(req.params.id);

      if (isNaN(auctionId)) {
        res.status(400).json({
          error: "Bad request",
          message: "Invalid auction ID",
        });
        return;
      }

      const { carId, startTime, endTime, startingPrice } = req.body;
      const existingAuction = await db
        .select()
        .from(auctions)
        .where(eq(auctions.auctionId, auctionId))
        .limit(1);

      if (existingAuction.length === 0) {
        res.status(404).json({
          error: "Not found",
          message: "Auction not found",
        });
        return;
      }
      if (
        existingAuction[0].status === "LIVE" ||
        existingAuction[0].status === "ENDED"
      ) {
        res.status(400).json({
          error: "Bad request",
          message: "Cannot update active or ended auction",
        });
        return;
      }

      const updateData: any = {};

      if (carId !== undefined) {
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
        updateData.carId = carId;
      }

      if (startTime !== undefined) {
        const start = new Date(startTime);
        if (isNaN(start.getTime())) {
          res.status(400).json({
            error: "Bad request",
            message: "Invalid start time",
          });
          return;
        }
        updateData.startTime = start;
      }

      if (endTime !== undefined) {
        const end = new Date(endTime);
        if (isNaN(end.getTime())) {
          res.status(400).json({
            error: "Bad request",
            message: "Invalid end time",
          });
          return;
        }
        updateData.endTime = end;
      }

      if (startingPrice !== undefined) {
        updateData.startingPrice = startingPrice.toString();
      }

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          error: "Bad request",
          message: "No fields to update",
        });
        return;
      }

      updateData.updatedAt = new Date();

      const updatedAuction = await db
        .update(auctions)
        .set(updateData)
        .where(eq(auctions.auctionId, auctionId))
        .returning();

      res.status(200).json({
        success: true,
        message: "Auction updated successfully",
        data: updatedAuction[0],
      });
    } catch (error) {
      console.error("Error updating auction:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to update auction",
      });
    }
  }
);
router.patch(
  "/auctions/:id/status",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const auctionId = parseInt(req.params.id);

      if (isNaN(auctionId)) {
        res.status(400).json({
          error: "Bad request",
          message: "Invalid auction ID",
        });
        return;
      }

      const { status } = req.body;

      if (!status) {
        res.status(400).json({
          error: "Bad request",
          message: "Status is required",
        });
        return;
      }

      const validStatuses = ["DRAFT", "LIVE", "ENDED", "CLOSED", "CANCELLED"];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          error: "Bad request",
          message: `Invalid status. Must be one of: ${validStatuses.join(
            ", "
          )}`,
        });
        return;
      }
      const existingAuction = await db
        .select()
        .from(auctions)
        .where(eq(auctions.auctionId, auctionId))
        .limit(1);

      if (existingAuction.length === 0) {
        res.status(404).json({
          error: "Not found",
          message: "Auction not found",
        });
        return;
      }

      const currentStatus = existingAuction[0].status;
      const validTransitions: Record<string, string[]> = {
        DRAFT: ["LIVE", "CANCELLED"],
        LIVE: ["ENDED", "CANCELLED"],
        ENDED: ["CLOSED"],
        CLOSED: [],
        CANCELLED: [],
      };

      if (!validTransitions[currentStatus]?.includes(status)) {
        res.status(400).json({
          error: "Bad request",
          message: `Cannot transition from ${currentStatus} to ${status}`,
        });
        return;
      }

      const updateData: any = {
        status,
        updatedAt: new Date(),
      };
      if (
        (status === "ENDED" || status === "CLOSED") &&
        currentStatus === "LIVE"
      ) {
        const highestBid = await db
          .select()
          .from(bids)
          .where(eq(bids.auctionId, auctionId))
          .orderBy(desc(bids.bidAmount))
          .limit(1);

        if (highestBid.length > 0) {
          updateData.winnerBidId = highestBid[0].bidId;
          updateData.currentHighestBid = highestBid[0].bidAmount;
        }
      }

      const updatedAuction = await db
        .update(auctions)
        .set(updateData)
        .where(eq(auctions.auctionId, auctionId))
        .returning();

      res.status(200).json({
        success: true,
        message: `Auction status updated to ${status}`,
        data: updatedAuction[0],
      });
    } catch (error) {
      console.error("Error updating auction status:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to update auction status",
      });
    }
  }
);
router.delete(
  "/auctions/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const auctionId = parseInt(req.params.id);

      if (isNaN(auctionId)) {
        res.status(400).json({
          error: "Bad request",
          message: "Invalid auction ID",
        });
        return;
      }
      const existingAuction = await db
        .select()
        .from(auctions)
        .where(eq(auctions.auctionId, auctionId))
        .limit(1);

      if (existingAuction.length === 0) {
        res.status(404).json({
          error: "Not found",
          message: "Auction not found",
        });
        return;
      }
      if (existingAuction[0].status === "LIVE") {
        res.status(400).json({
          error: "Bad request",
          message: "Cannot delete active auction",
        });
        return;
      }

      await db.delete(auctions).where(eq(auctions.auctionId, auctionId));

      res.status(200).json({
        success: true,
        message: "Auction deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting auction:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to delete auction",
      });
    }
  }
);

export default router;
