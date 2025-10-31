import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  varchar,
  decimal,
} from "drizzle-orm/pg-core";

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
