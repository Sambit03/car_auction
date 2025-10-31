import { Router, Request, Response } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../app";
import { bids, auctions, dealers, insertBidSchema } from "../db/schema";
import { validateRequest } from "../middleware/validateRequest";
import { z } from "zod";

const placeBidSchema = z.object({
  dealerId: z.number().int().positive(),
  amount: z.number().positive(),
});

const router = Router();
router.get("/bids", async (req: Request, res: Response): Promise<void> => {
  try {
    const allBids = await db
      .select({
        bidId: bids.bidId,
        auctionId: bids.auctionId,
        dealerId: bids.dealerId,
        dealerName: dealers.name,
        bidAmount: bids.bidAmount,
        previousBid: bids.previousBid,
        timePlaced: bids.timePlaced,
      })
      .from(bids)
      .leftJoin(dealers, eq(bids.dealerId, dealers.dealerId))
      .orderBy(desc(bids.timePlaced));

    res.status(200).json({
      success: true,
      count: allBids.length,
      data: allBids,
    });
  } catch (error) {
    console.error("Error fetching bids:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch bids",
    });
  }
});
router.get("/bids/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const bidId = parseInt(req.params.id);

    if (isNaN(bidId)) {
      res.status(400).json({
        error: "Bad request",
        message: "Invalid bid ID",
      });
      return;
    }

    const bid = await db
      .select({
        bidId: bids.bidId,
        auctionId: bids.auctionId,
        dealerId: bids.dealerId,
        dealerName: dealers.name,
        bidAmount: bids.bidAmount,
        previousBid: bids.previousBid,
        timePlaced: bids.timePlaced,
      })
      .from(bids)
      .leftJoin(dealers, eq(bids.dealerId, dealers.dealerId))
      .where(eq(bids.bidId, bidId))
      .limit(1);

    if (bid.length === 0) {
      res.status(404).json({
        error: "Not found",
        message: "Bid not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: bid[0],
    });
  } catch (error) {
    console.error("Error fetching bid:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch bid",
    });
  }
});
router.get(
  "/auctions/:auctionId/bids",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const auctionId = parseInt(req.params.auctionId);

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

      const auctionBids = await db
        .select({
          bidId: bids.bidId,
          dealerId: bids.dealerId,
          dealerName: dealers.name,
          bidAmount: bids.bidAmount,
          previousBid: bids.previousBid,
          timePlaced: bids.timePlaced,
        })
        .from(bids)
        .leftJoin(dealers, eq(bids.dealerId, dealers.dealerId))
        .where(eq(bids.auctionId, auctionId))
        .orderBy(desc(bids.bidAmount));

      res.status(200).json({
        success: true,
        auctionId,
        count: auctionBids.length,
        data: auctionBids,
      });
    } catch (error) {
      console.error("Error fetching auction bids:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to fetch auction bids",
      });
    }
  }
);
router.get(
  "/dealers/:id/bids",
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
        .select()
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

      const dealerBids = await db
        .select({
          bidId: bids.bidId,
          auctionId: bids.auctionId,
          bidAmount: bids.bidAmount,
          previousBid: bids.previousBid,
          timePlaced: bids.timePlaced,
        })
        .from(bids)
        .where(eq(bids.dealerId, dealerId))
        .orderBy(desc(bids.timePlaced));

      res.status(200).json({
        success: true,
        dealerId,
        dealerName: dealer[0].name,
        count: dealerBids.length,
        data: dealerBids,
      });
    } catch (error) {
      console.error("Error fetching dealer bids:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to fetch dealer bids",
      });
    }
  }
);
router.post(
  "/auctions/:auctionId/bids",
  validateRequest(placeBidSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const auctionId = parseInt(req.params.auctionId);

      if (isNaN(auctionId)) {
        res.status(400).json({
          error: "Bad request",
          message: "Invalid auction ID",
        });
        return;
      }

      const { dealerId, amount } = req.body;

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

      if (auction[0].status !== "LIVE") {
        res.status(400).json({
          error: "Bad request",
          message: `Auction is not open for bidding (current status: ${auction[0].status})`,
        });
        return;
      }
      const dealer = await db
        .select()
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
      const highestBid = await db
        .select()
        .from(bids)
        .where(eq(bids.auctionId, auctionId))
        .orderBy(desc(bids.bidAmount))
        .limit(1);

      const startingPrice = parseFloat(auction[0].startingPrice);
      const minimumBid =
        highestBid.length > 0
          ? parseFloat(highestBid[0].bidAmount)
          : startingPrice;

      if (amount <= minimumBid) {
        res.status(400).json({
          error: "Bad request",
          message: `Bid amount must be greater than current highest bid (${minimumBid})`,
        });
        return;
      }
      const newBid = await db
        .insert(bids)
        .values({
          auctionId,
          dealerId,
          bidAmount: amount.toString(),
          previousBid: highestBid.length > 0 ? highestBid[0].bidAmount : null,
        })
        .returning();
      await db
        .update(auctions)
        .set({
          currentHighestBid: amount.toString(),
          updatedAt: new Date(),
        })
        .where(eq(auctions.auctionId, auctionId));

      res.status(201).json({
        success: true,
        message: "Bid placed successfully",
        data: newBid[0],
      });
    } catch (error) {
      console.error("Error placing bid:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to place bid",
      });
    }
  }
);
router.put("/bids/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const bidId = parseInt(req.params.id);

    if (isNaN(bidId)) {
      res.status(400).json({
        error: "Bad request",
        message: "Invalid bid ID",
      });
      return;
    }

    const { amount } = req.body;

    if (!amount) {
      res.status(400).json({
        error: "Bad request",
        message: "Amount is required",
      });
      return;
    }

    if (typeof amount !== "number" || amount <= 0) {
      res.status(400).json({
        error: "Bad request",
        message: "Invalid bid amount",
      });
      return;
    }
    const existingBid = await db
      .select()
      .from(bids)
      .where(eq(bids.bidId, bidId))
      .limit(1);

    if (existingBid.length === 0) {
      res.status(404).json({
        error: "Not found",
        message: "Bid not found",
      });
      return;
    }
    const auction = await db
      .select()
      .from(auctions)
      .where(eq(auctions.auctionId, existingBid[0].auctionId!))
      .limit(1);

    if (auction.length === 0 || auction[0].status !== "LIVE") {
      res.status(400).json({
        error: "Bad request",
        message: "Cannot update bid for closed auction",
      });
      return;
    }

    const updatedBid = await db
      .update(bids)
      .set({
        bidAmount: amount.toString(),
      })
      .where(eq(bids.bidId, bidId))
      .returning();

    res.status(200).json({
      success: true,
      message: "Bid updated successfully",
      data: updatedBid[0],
    });
  } catch (error) {
    console.error("Error updating bid:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update bid",
    });
  }
});
router.delete(
  "/bids/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const bidId = parseInt(req.params.id);

      if (isNaN(bidId)) {
        res.status(400).json({
          error: "Bad request",
          message: "Invalid bid ID",
        });
        return;
      }
      const existingBid = await db
        .select()
        .from(bids)
        .where(eq(bids.bidId, bidId))
        .limit(1);

      if (existingBid.length === 0) {
        res.status(404).json({
          error: "Not found",
          message: "Bid not found",
        });
        return;
      }
      const auction = await db
        .select()
        .from(auctions)
        .where(eq(auctions.auctionId, existingBid[0].auctionId!))
        .limit(1);

      if (auction.length === 0 || auction[0].status !== "LIVE") {
        res.status(400).json({
          error: "Bad request",
          message: "Cannot delete bid for closed auction",
        });
        return;
      }

      await db.delete(bids).where(eq(bids.bidId, bidId));

      res.status(200).json({
        success: true,
        message: "Bid deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting bid:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to delete bid",
      });
    }
  }
);

export default router;
