import type { Product, PriceResult, Reason, Competitor } from "../types";
export type { Product, PriceResult, Reason, Competitor };

export type UserRole = "ADMIN" | "ANALYST" | "VIEWER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  sku: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  reason: Reason;
  triggeredBy: string;
  role: UserRole;
}

export interface ProductRow extends Product {
  result?: PriceResult;
}

export interface SortConfig {
  key: "sku" | "name" | "oldPrice" | "newPrice" | "delta" | "reason";
  direction: "asc" | "desc";
}
