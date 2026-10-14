import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "./server";
import productsData from "../data/products.json";
import expectedData from "../data/expected.json";

const app = createApp();

describe("API Server", () => {
  describe("GET /health", () => {
    it("returns status ok", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok" });
    });
  });

  describe("GET /api/products", () => {
    it("returns demo products list", async () => {
      const res = await request(app).get("/api/products");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("sku");
    });
  });

  describe("POST /reprice", () => {
    it("returns 200 with PriceResult[] matching expected.json for products.json", async () => {
      const res = await request(app)
        .post("/reprice")
        .send(productsData)
        .set("Content-Type", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(expectedData);
    });

    it("returns 200 with an empty array when given an empty array", async () => {
      const res = await request(app)
        .post("/reprice")
        .send([])
        .set("Content-Type", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("returns 400 when body is not an array (object)", async () => {
      const res = await request(app)
        .post("/reprice")
        .send({ sku: "TEST-1", myPrice: 100 })
        .set("Content-Type", "application/json");

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toContain("must be an array");
    });

    it("returns 400 when body is null or a raw string", async () => {
      const res = await request(app)
        .post("/reprice")
        .set("Content-Type", "application/json")
        .send(JSON.stringify("not-an-array"));

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 when body contains malformed JSON", async () => {
      const res = await request(app)
        .post("/reprice")
        .set("Content-Type", "application/json")
        .send("{ malformed: json");

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 when an array element is malformed", async () => {
      const malformedProducts = [
        {
          sku: "VALID-1",
          name: "Valid",
          myPrice: 1000,
          minPrice: 500,
          maxPrice: 2000,
          step: 10,
          competitors: [],
        },
        {
          sku: 123, // invalid type
          myPrice: "not-a-number",
        },
      ];

      const res = await request(app)
        .post("/reprice")
        .send(malformedProducts)
        .set("Content-Type", "application/json");

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Invalid product format at index 1");
    });
  });
});
