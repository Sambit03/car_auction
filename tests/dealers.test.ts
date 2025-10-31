import request from "supertest";
import app from "../src/app";

describe("Dealer Routes", () => {
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

  describe("GET /api/dealers", () => {
    it("should return 401 without authentication token", async () => {
      const response = await request(app).get("/api/dealers");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    it("should return dealers list with valid token", async () => {
      const response = await request(app)
        .get("/api/dealers")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should not include password hash in response", async () => {
      const response = await request(app)
        .get("/api/dealers")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).not.toHaveProperty("passwordHash");
      }
    });
  });

  describe("POST /api/dealers/register", () => {
    const uniqueEmail = `test${Date.now()}@example.com`;

    it("should return 401 without authentication token", async () => {
      const response = await request(app).post("/api/dealers/register").send({
        name: "Test Dealer",
        email: uniqueEmail,
        password: "password123",
      });

      expect(response.status).toBe(401);
    });

    it("should return 400 with missing required fields", async () => {
      const response = await request(app)
        .post("/api/dealers/register")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Dealer",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 with invalid email format", async () => {
      const response = await request(app)
        .post("/api/dealers/register")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Dealer",
          email: "invalid-email",
          password: "password123",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Validation failed");
    });

    it("should return 400 with short password", async () => {
      const response = await request(app)
        .post("/api/dealers/register")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Dealer",
          email: uniqueEmail,
          password: "123",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Validation failed");
    });
  });

  describe("GET /api/dealers/:id", () => {
    it("should return 400 for invalid dealer ID", async () => {
      const response = await request(app)
        .get("/api/dealers/invalid")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Invalid dealer ID");
    });

    it("should return 404 for non-existent dealer", async () => {
      const response = await request(app)
        .get("/api/dealers/999999")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain("Dealer not found");
    });
  });
});
