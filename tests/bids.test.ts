import request from "supertest";
import app from "../src/app";

describe("Bid Routes", () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await request(app)
      .post("/api/v1/auction/token")
      .send({
        username: process.env.ADMIN_USERNAME || "admin",
        password: process.env.ADMIN_PASSWORD || "adminpassword007",
      });
    authToken = response.body.token;
  });

  describe("GET /api/bids", () => {
    it("should return 401 without authentication token", async () => {
      const response = await request(app).get("/api/bids");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    it("should return bids list with valid token", async () => {
      const response = await request(app)
        .get("/api/bids")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("GET /api/bids/:id", () => {
    it("should return 400 for invalid bid ID", async () => {
      const response = await request(app)
        .get("/api/bids/invalid")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Invalid bid ID");
    });

    it("should return 404 for non-existent bid", async () => {
      const response = await request(app)
        .get("/api/bids/999999")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain("Bid not found");
    });
  });

  describe("POST /api/auctions/:auctionId/bids", () => {
    it("should return 401 without authentication token", async () => {
      const response = await request(app).post("/api/auctions/1/bids").send({
        dealerId: 1,
        amount: 15000,
      });

      expect(response.status).toBe(401);
    });

    it("should return 400 with invalid auction ID", async () => {
      const response = await request(app)
        .post("/api/auctions/invalid/bids")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          dealerId: 1,
          amount: 15000,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Invalid auction ID");
    });

    it("should return 400 with missing dealerId", async () => {
      const response = await request(app)
        .post("/api/auctions/1/bids")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          amount: 15000,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Validation failed");
    });

    it("should return 400 with missing amount", async () => {
      const response = await request(app)
        .post("/api/auctions/1/bids")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          dealerId: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Validation failed");
    });

    it("should return 400 with invalid amount (negative)", async () => {
      const response = await request(app)
        .post("/api/auctions/1/bids")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          dealerId: 1,
          amount: -1000,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Validation failed");
    });

    it("should return 400 with invalid dealerId (negative)", async () => {
      const response = await request(app)
        .post("/api/auctions/1/bids")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          dealerId: -1,
          amount: 15000,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Validation failed");
    });

    it("should return 404 for non-existent auction", async () => {
      const response = await request(app)
        .post("/api/auctions/999999/bids")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          dealerId: 1,
          amount: 15000,
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain("Auction not found");
    });

    it("should have rate limiting for bid placement", async () => {
      const response = await request(app)
        .post("/api/auctions/1/bids")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          dealerId: 1,
          amount: 15000,
        });

      expect(response.headers).toHaveProperty("ratelimit-limit");
      expect(response.headers).toHaveProperty("ratelimit-remaining");
    });
  });
});
