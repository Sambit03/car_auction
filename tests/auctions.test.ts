import request from "supertest";
import app from "../src/app";

describe("Auction Routes", () => {
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

  describe("GET /api/auctions", () => {
    it("should return 401 without authentication token", async () => {
      const response = await request(app).get("/api/auctions");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    it("should return auctions list with valid token", async () => {
      const response = await request(app)
        .get("/api/auctions")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("GET /api/auctions/active", () => {
    it("should return 401 without authentication token", async () => {
      const response = await request(app).get("/api/auctions/active");

      expect(response.status).toBe(401);
    });

    it("should return active auctions with valid token", async () => {
      const response = await request(app)
        .get("/api/auctions/active")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("POST /api/auctions", () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const futureDateEnd = new Date(Date.now() + 172800000).toISOString();

    it("should return 401 without authentication token", async () => {
      const response = await request(app).post("/api/auctions").send({
        carId: 1,
        startTime: futureDate,
        endTime: futureDateEnd,
        startingPrice: "10000",
        createdBy: 1,
      });

      expect(response.status).toBe(401);
    });

    it("should return 400 with missing required fields", async () => {
      const response = await request(app)
        .post("/api/auctions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          carId: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 with invalid carId type", async () => {
      const response = await request(app)
        .post("/api/auctions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          carId: "invalid",
          startTime: futureDate,
          endTime: futureDateEnd,
          startingPrice: "10000",
          createdBy: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Validation failed");
    });

    it("should return 404 for non-existent car", async () => {
      const response = await request(app)
        .post("/api/auctions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          carId: 999999,
          startTime: futureDate,
          endTime: futureDateEnd,
          startingPrice: "10000",
          createdBy: 1,
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain("Car not found");
    });
  });

  describe("GET /api/auctions/:id", () => {
    it("should return 400 for invalid auction ID", async () => {
      const response = await request(app)
        .get("/api/auctions/invalid")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Invalid auction ID");
    });

    it("should return 404 for non-existent auction", async () => {
      const response = await request(app)
        .get("/api/auctions/999999")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain("Auction not found");
    });
  });
});
