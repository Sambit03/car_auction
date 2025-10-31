import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  varchar,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const cars = pgTable("car", {
  carId: serial("car_id").primaryKey(),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dealers = pgTable("dealer", {
  dealerId: serial("dealer_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bids = pgTable("bid", {
  bidId: serial("bid_id").primaryKey(),
  auctionId: integer("auction_id"),
  dealerId: integer("dealer_id").references(() => dealers.dealerId),
  bidAmount: decimal("bid_amount", { precision: 10, scale: 2 }).notNull(),
  previousBid: decimal("previous_bid", { precision: 10, scale: 2 }),
  timePlaced: timestamp("time_placed").defaultNow(),
});

export const auctions = pgTable("auction", {
  auctionId: serial("auction_id").primaryKey(),
  createdBy: integer("created_by").references(() => dealers.dealerId),
  carId: integer("car_id").references(() => cars.carId),
  startingPrice: decimal("starting_price", {
    precision: 10,
    scale: 2,
  }).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("DRAFT"),
  currentHighestBid: decimal("current_highest_bid", {
    precision: 10,
    scale: 2,
  }),
  winnerBidId: integer("winner_bid_id").references(() => bids.bidId),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCarSchema = createInsertSchema(cars, {
  make: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
}).omit({
  carId: true,
  createdAt: true,
  updatedAt: true,
});

export const selectCarSchema = createSelectSchema(cars);

export const insertDealerSchema = createInsertSchema(dealers, {
  name: z.string().min(1).max(100),
  email: z.string().email().max(100),
  passwordHash: z.string().min(6),
}).omit({
  dealerId: true,
  createdAt: true,
  updatedAt: true,
});

export const selectDealerSchema = createSelectSchema(dealers);

export const insertBidSchema = createInsertSchema(bids, {
  auctionId: z.number().int().positive(),
  dealerId: z.number().int().positive(),
  bidAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  previousBid: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
}).omit({
  bidId: true,
  timePlaced: true,
});

export const selectBidSchema = createSelectSchema(bids);

export const insertAuctionSchema = createInsertSchema(auctions, {
  createdBy: z.number().int().positive(),
  carId: z.number().int().positive(),
  startingPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  status: z
    .enum(["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"])
    .default("DRAFT"),
  currentHighestBid: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  winnerBidId: z.number().int().positive().optional(),
}).omit({
  auctionId: true,
  createdAt: true,
  updatedAt: true,
});

export const selectAuctionSchema = createSelectSchema(auctions);

export type InsertCar = z.infer<typeof insertCarSchema>;
export type SelectCar = z.infer<typeof selectCarSchema>;

export type InsertDealer = z.infer<typeof insertDealerSchema>;
export type SelectDealer = z.infer<typeof selectDealerSchema>;

export type InsertBid = z.infer<typeof insertBidSchema>;
export type SelectBid = z.infer<typeof selectBidSchema>;

export type InsertAuction = z.infer<typeof insertAuctionSchema>;
export type SelectAuction = z.infer<typeof selectAuctionSchema>;
