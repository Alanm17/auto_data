import express, { type Request, type Response } from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { calculatePrice } from "./pricing";
import type { Product } from "./types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  // Обработчик синтаксических ошибок JSON
  app.use((err: any, _req: Request, res: Response, next: any) => {
    if (err && "status" in err && err.status === 400) {
      return res.status(400).json({ error: "Invalid JSON payload" });
    }
    next(err);
  });

  // Health check
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // Эндпоинт для получения демо-товаров для удобства тестирования из фронтенда
  app.get("/api/products", (_req: Request, res: Response) => {
    try {
      const dataPath = path.resolve(__dirname, "../data/products.json");
      if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, "utf-8");
        return res.json(JSON.parse(data));
      }
      return res.status(404).json({ error: "products.json not found" });
    } catch {
      return res.status(500).json({ error: "Failed to read demo products" });
    }
  });

  /**
   * POST /reprice
   * Тело: Product[]
   * Ответ: 200 -> PriceResult[] в том же порядке
   * Ошибка: 400 при некорректном теле (не массив или невалидные товары)
   */
  app.post("/reprice", (req: Request, res: Response) => {
    const products = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({
        error: "Request body must be an array of products",
      });
    }

    // Валидация структуры каждого товара
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      if (
        !p ||
        typeof p !== "object" ||
        typeof p.sku !== "string" ||
        typeof p.myPrice !== "number" ||
        typeof p.minPrice !== "number" ||
        typeof p.maxPrice !== "number" ||
        typeof p.step !== "number" ||
        !Array.isArray(p.competitors)
      ) {
        return res.status(400).json({
          error: `Invalid product format at index ${i}`,
        });
      }
    }

    try {
      const results = (products as Product[]).map((product) =>
        calculatePrice(product)
      );
      return res.status(200).json(results);
    } catch {
      return res.status(500).json({
        error: "Failed to recalculate prices",
      });
    }
  });

  // Раздача статики собранного фронтенда (если dist существует)
  const distPath = path.resolve(__dirname, "../dist");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}

// Запуск сервера при прямом вызове
const isDirectExecution =
  process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectExecution || process.env.NODE_ENV !== "test") {
  const app = createApp();
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 SaleScout API server running on http://localhost:${PORT}`);
    console.log(`📦 POST /reprice is ready`);
  });
}
