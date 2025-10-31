import request from "supertest";
import app from "../src/app";

describe("Auth Routes", () => {
  describe("POST /api/v1/auction/token", () => {
    it("should return 400 if username is missing", async () => {
      const response = await request(app).post("/api/v1/auction/token").send({
        password: "testpassword",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.message).toContain(
        "Username and password are required"
      );
    });

    it("should return 400 if password is missing", async () => {
      const response = await request(app).post("/api/v1/auction/token").send({
        username: "testuser",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.message).toContain(
        "Username and password are required"
      );
    });

    it("should return 401 for invalid credentials", async () => {
      const response = await request(app).post("/api/v1/auction/token").send({
        username: "wronguser",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
      expect(response.body.message).toContain("Invalid credentials");
    });

    it("should return token for valid admin credentials", async () => {
      const response = await request(app)
        .post("/api/v1/auction/token")
        .send({
          username: process.env.ADMIN_USERNAME || "admin",
          password: process.env.ADMIN_PASSWORD || "adminpassword007",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(typeof response.body.token).toBe("string");
      expect(response.body.token.length).toBeGreaterThan(0);
    });

    it("should have rate limiting headers", async () => {
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
