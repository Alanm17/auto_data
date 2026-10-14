import type { Product, PriceResult, Reason } from "./types";

/**
 * Чистая функция: рассчитывает новую цену для одного товара.
 * 
 * Правила:
 * 1. Учитываются только конкуренты с inStock: true.
 * 2. Если таких конкурентов нет -> newPrice = maxPrice, reason = "NO_COMPETITORS".
 * 3. Иначе best = минимальная цена среди активных конкурентов.
 * 4. candidate = Math.floor(best - step).
 * 5. Диапазон [minPrice, maxPrice]:
 *    - candidate < minPrice -> newPrice = minPrice, reason = "AT_MIN"
 *    - candidate > maxPrice -> newPrice = maxPrice, reason = "AT_MAX"
 *    - иначе -> newPrice = candidate, reason = "UNDERCUT"
 * 
 * myPrice на расчёт не влияет и возвращается как oldPrice.
 */
export function calculatePrice(product: Product): PriceResult {
  const inStockCompetitors = product.competitors.filter(
    (competitor) => competitor.inStock
  );

  if (inStockCompetitors.length === 0) {
    return {
      sku: product.sku,
      oldPrice: product.myPrice,
      newPrice: product.maxPrice,
      reason: "NO_COMPETITORS",
    };
  }

  // Находим минимальную цену среди конкурентов в наличии
  let best = inStockCompetitors[0].price;
  for (let i = 1; i < inStockCompetitors.length; i++) {
    if (inStockCompetitors[i].price < best) {
      best = inStockCompetitors[i].price;
    }
  }

  // Округление вниз до целого тенге
  const candidate = Math.floor(best - product.step);

  let newPrice: number;
  let reason: Reason;

  if (candidate < product.minPrice) {
    newPrice = product.minPrice;
    reason = "AT_MIN";
  } else if (candidate > product.maxPrice) {
    newPrice = product.maxPrice;
    reason = "AT_MAX";
  } else {
    newPrice = candidate;
    reason = "UNDERCUT";
  }

  return {
    sku: product.sku,
    oldPrice: product.myPrice,
    newPrice,
    reason,
  };
}

