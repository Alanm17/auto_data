import { describe, it, expect } from "vitest";
import { calculatePrice } from "./pricing";
import type { Product } from "./types";
import productsData from "../data/products.json";
import expectedData from "../data/expected.json";

describe("calculatePrice", () => {
  it("matches all products from sample data (products.json -> expected.json)", () => {
    const results = (productsData as Product[]).map(calculatePrice);
    expect(results).toEqual(expectedData);
  });

  describe("NO_COMPETITORS rule", () => {
    it("sets newPrice to maxPrice when competitors list is empty", () => {
      const product: Product = {
        sku: "TEST-EMPTY",
        name: "Test Product",
        myPrice: 50000,
        minPrice: 40000,
        maxPrice: 60000,
        step: 10,
        competitors: [],
      };

      const result = calculatePrice(product);
      expect(result).toEqual({
        sku: "TEST-EMPTY",
        oldPrice: 50000,
        newPrice: 60000,
        reason: "NO_COMPETITORS",
      });
    });

    it("sets newPrice to maxPrice when all competitors have inStock: false", () => {
      const product: Product = {
        sku: "TEST-OOS",
        name: "Test Product",
        myPrice: 89990,
        minPrice: 80000,
        maxPrice: 99990,
        step: 50,
        competitors: [
          { seller: "ShopA", price: 82000, inStock: false },
          { seller: "ShopB", price: 79000, inStock: false },
        ],
      };

      const result = calculatePrice(product);
      expect(result).toEqual({
        sku: "TEST-OOS",
        oldPrice: 89990,
        newPrice: 99990,
        reason: "NO_COMPETITORS",
      });
    });
  });

  describe("UNDERCUT rule", () => {
    it("undercuts the lowest in-stock competitor by step (integer step)", () => {
      const product: Product = {
        sku: "TEST-UNDERCUT",
        name: "iPhone",
        myPrice: 389990,
        minPrice: 370000,
        maxPrice: 420000,
        step: 10,
        competitors: [
          { seller: "Shop1", price: 384990, inStock: true },
          { seller: "Shop2", price: 386500, inStock: true },
          { seller: "Shop3", price: 375000, inStock: false }, // should be ignored
        ],
      };

      const result = calculatePrice(product);
      expect(result).toEqual({
        sku: "TEST-UNDERCUT",
        oldPrice: 389990,
        newPrice: 384980,
        reason: "UNDERCUT",
      });
    });

    it("rounds down to integer Tenge when candidate has decimals (Math.floor)", () => {
      const product: Product = {
        sku: "TEST-DECIMALS",
        name: "Dyson Vacuum",
        myPrice: 359000,
        minPrice: 330000,
        maxPrice: 380000,
        step: 0.5,
        competitors: [
          { seller: "HomeTech", price: 349999.9, inStock: true },
        ],
      };

      // 349999.9 - 0.5 = 349999.4 -> floor is 349999
      const result = calculatePrice(product);
      expect(result).toEqual({
        sku: "TEST-DECIMALS",
        oldPrice: 359000,
        newPrice: 349999,
        reason: "UNDERCUT",
      });
    });

    it("supports step = 0 (matching competitor price)", () => {
      const product: Product = {
        sku: "TEST-ZERO-STEP",
        name: "Zero Step Item",
        myPrice: 10000,
        minPrice: 5000,
        maxPrice: 15000,
        step: 0,
        competitors: [
          { seller: "SellerA", price: 9500, inStock: true },
        ],
      };

      const result = calculatePrice(product);
      expect(result).toEqual({
        sku: "TEST-ZERO-STEP",
        oldPrice: 10000,
        newPrice: 9500,
        reason: "UNDERCUT",
      });
    });

    it("handles multiple competitors having identical minimum price", () => {
      const product: Product = {
        sku: "TEST-TIE",
        name: "Tie Item",
        myPrice: 50000,
        minPrice: 40000,
        maxPrice: 60000,
        step: 50,
        competitors: [
          { seller: "ShopA", price: 45000, inStock: true },
          { seller: "ShopB", price: 45000, inStock: true },
        ],
      };

      const result = calculatePrice(product);
      expect(result).toEqual({
        sku: "TEST-TIE",
        oldPrice: 50000,
        newPrice: 44950,
        reason: "UNDERCUT",
      });
    });
  });

  describe("AT_MIN clamp rule", () => {
    it("sets newPrice to minPrice with reason AT_MIN when candidate < minPrice", () => {
      const product: Product = {
        sku: "TEST-AT-MIN",
        name: "Galaxy Phone",
        myPrice: 189000,
        minPrice: 180000,
        maxPrice: 210000,
        step: 100,
        competitors: [
          { seller: "MobiStore", price: 175000, inStock: true },
        ],
      };

      // 175000 - 100 = 174900 < 180000
      const result = calculatePrice(product);
      expect(result).toEqual({
        sku: "TEST-AT-MIN",
        oldPrice: 189000,
        newPrice: 180000,
        reason: "AT_MIN",
      });
    });
  });

  describe("AT_MAX clamp rule", () => {
    it("sets newPrice to maxPrice with reason AT_MAX when candidate > maxPrice", () => {
      const product: Product = {
        sku: "TEST-AT-MAX",
        name: "AirPods Pro",
        myPrice: 119990,
        minPrice: 100000,
        maxPrice: 125000,
        step: 1,
        competitors: [
          { seller: "EarShop", price: 150000, inStock: true },
        ],
      };

      // 150000 - 1 = 149999 > 125000
      const result = calculatePrice(product);
      expect(result).toEqual({
        sku: "TEST-AT-MAX",
        oldPrice: 119990,
        newPrice: 125000,
        reason: "AT_MAX",
      });
    });
  });

  describe("Inclusive boundaries behavior", () => {
    it("returns UNDERCUT when candidate is exactly minPrice", () => {
      const product: Product = {
        sku: "TEST-EXACT-MIN",
        name: "Boundary Item Min",
        myPrice: 12000,
        minPrice: 10000,
        maxPrice: 15000,
        step: 500,
        competitors: [
          { seller: "Comp1", price: 10500, inStock: true },
        ],
      };

      // 10500 - 500 = 10000 === minPrice
      const result = calculatePrice(product);
      expect(result).toEqual({
        sku: "TEST-EXACT-MIN",
        oldPrice: 12000,
        newPrice: 10000,
        reason: "UNDERCUT",
      });
    });

    it("returns UNDERCUT when candidate is exactly maxPrice", () => {
      const product: Product = {
        sku: "TEST-EXACT-MAX",
        name: "Boundary Item Max",
        myPrice: 12000,
        minPrice: 10000,
        maxPrice: 15000,
        step: 500,
        competitors: [
          { seller: "Comp1", price: 15500, inStock: true },
        ],
      };

      // 15500 - 500 = 15000 === maxPrice
      const result = calculatePrice(product);
      expect(result).toEqual({
        sku: "TEST-EXACT-MAX",
        oldPrice: 12000,
        newPrice: 15000,
        reason: "UNDERCUT",
      });
    });
  });

  describe("myPrice independence", () => {
    it("does not let myPrice affect the calculated newPrice", () => {
      const baseProduct: Omit<Product, "myPrice"> = {
        sku: "TEST-MYPRICE",
        name: "Item",
        minPrice: 10000,
        maxPrice: 20000,
        step: 100,
        competitors: [{ seller: "Comp", price: 15000, inStock: true }],
      };

      const result1 = calculatePrice({ ...baseProduct, myPrice: 5000 });
      const result2 = calculatePrice({ ...baseProduct, myPrice: 18000 });
      const result3 = calculatePrice({ ...baseProduct, myPrice: 99999 });

      expect(result1.newPrice).toBe(14900);
      expect(result1.oldPrice).toBe(5000);

      expect(result2.newPrice).toBe(14900);
      expect(result2.oldPrice).toBe(18000);

      expect(result3.newPrice).toBe(14900);
      expect(result3.oldPrice).toBe(99999);
    });
  });
});
