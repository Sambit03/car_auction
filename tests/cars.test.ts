import request from "supertest";
import app from "../src/app";

describe("Car Routes", () => {
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

  describe("GET /api/cars", () => {
    it("should return 401 without authentication token", async () => {
      const response = await request(app).get("/api/cars");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 401 with invalid token", async () => {
      const response = await request(app)
        .get("/api/cars")
        .set("Authorization", "Bearer invalid_token");

      expect(response.status).toBe(401);
    });

    it("should return cars list with valid token", async () => {
      const response = await request(app)
        .get("/api/cars")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should have rate limiting headers", async () => {
      const response = await request(app)
        .get("/api/cars")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.headers).toHaveProperty("ratelimit-limit");
      expect(response.headers).toHaveProperty("ratelimit-remaining");
    });
  });

  describe("POST /api/cars", () => {
    it("should return 401 without authentication token", async () => {
      const response = await request(app).post("/api/cars").send({
        make: "Toyota",
        model: "Camry",
        year: 2024,
      });

      expect(response.status).toBe(401);
    });

    it("should return 400 with missing required fields", async () => {
      const response = await request(app)
        .post("/api/cars")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          make: "Toyota",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 with invalid year (too old)", async () => {
      const response = await request(app)
        .post("/api/cars")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          make: "Toyota",
          model: "Camry",
          year: 1800,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 with invalid year (future)", async () => {
      const response = await request(app)
        .post("/api/cars")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          make: "Toyota",
          model: "Camry",
          year: 2030,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 with invalid data types", async () => {
      const response = await request(app)
        .post("/api/cars")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          make: "Toyota",
          model: "Camry",
          year: "2024",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Validation failed");
    });
  });

  describe("GET /api/cars/:id", () => {
    it("should return 400 for invalid car ID", async () => {
      const response = await request(app)
        .get("/api/cars/invalid")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Invalid car ID");
    });

    it("should return 404 for non-existent car", async () => {
      const response = await request(app)
        .get("/api/cars/999999")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain("Car not found");
    });
  });
});
