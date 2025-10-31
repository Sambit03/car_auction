import request from "supertest";
import app from "../src/app";

describe("Health and Middleware", () => {
  describe("GET /health", () => {
    it("should return 200 status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
    });

    it("should return success status", async () => {
      const response = await request(app).get("/health");

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message", "Server is running");
      expect(response.body).toHaveProperty("timestamp");
    });

    it("should have security headers from helmet", async () => {
      const response = await request(app).get("/health");

      expect(response.headers).toHaveProperty("x-dns-prefetch-control");
      expect(response.headers).toHaveProperty("x-frame-options");
      expect(response.headers).toHaveProperty("x-content-type-options");
      expect(response.headers).toHaveProperty("x-xss-protection");
    });

    it("should not require authentication", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
    });
  });

  describe("404 Handler", () => {
    it("should return 404 for non-existent routes", async () => {
      const response = await request(app).get("/non-existent-route");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Not found");
      expect(response.body.message).toContain(
        "The requested resource was not found"
      );
    });
  });

  describe("JWT Middleware", () => {
    it("should reject requests without Authorization header", async () => {
      const response = await request(app).get("/api/cars");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
      expect(response.body.message).toContain("No token provided");
    });

    it("should reject requests with malformed Authorization header", async () => {
      const response = await request(app)
        .get("/api/cars")
        .set("Authorization", "InvalidFormat");

      expect(response.status).toBe(401);
      expect(response.body.message).toContain("No token provided");
    });

    it("should reject requests with invalid token", async () => {
      const response = await request(app)
        .get("/api/cars")
        .set("Authorization", "Bearer invalid_token_here");

      expect(response.status).toBe(401);
    });

    it("should accept requests with valid token", async () => {
      const authResponse = await request(app)
        .post("/api/v1/auction/token")
        .send({
          username: process.env.ADMIN_USERNAME || "admin",
          password: process.env.ADMIN_PASSWORD || "adminpassword007",
        });

      const token = authResponse.body.token;

      const response = await request(app)
        .get("/api/cars")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
    });
  });

  describe("Security Headers", () => {
    it("should have Content-Security-Policy header", async () => {
      const response = await request(app).get("/health");

      expect(response.headers).toHaveProperty("content-security-policy");
    });

    it("should have X-Frame-Options set to DENY", async () => {
      const response = await request(app).get("/health");

      expect(response.headers["x-frame-options"]).toBe("DENY");
    });

    it("should have X-Content-Type-Options set to nosniff", async () => {
      const response = await request(app).get("/health");

      expect(response.headers["x-content-type-options"]).toBe("nosniff");
    });
  });

  describe("Rate Limiting", () => {
    it("should include rate limit headers", async () => {
      const response = await request(app).post("/api/v1/auction/token").send({
        username: "test",
        password: "test",
      });

      expect(response.headers).toHaveProperty("ratelimit-limit");
      expect(response.headers).toHaveProperty("ratelimit-remaining");
      expect(response.headers).toHaveProperty("ratelimit-reset");
    });
  });
});
