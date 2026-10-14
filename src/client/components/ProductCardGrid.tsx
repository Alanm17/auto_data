import React from "react";
import {
  Copy,
  Check,
  Sliders,
  Trash2,
  TrendingDown,
  ShieldAlert,
  ArrowUpRight,
  UserX,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { ProductRow, Reason } from "../types";
import { useAuth } from "../context/AuthContext";
import { getProductBrandInfo } from "./BrandIcons";

interface ProductCardGridProps {
  rows: ProductRow[];
  onInspect: (product: ProductRow) => void;
  onDeleteProduct: (sku: string) => void;
}

const REASON_CONFIG: Record<
  Reason,
  { label: string; explanation: string; icon: LucideIcon; className: string }
> = {
  UNDERCUT: {
    label: "Победа в Buy Box",
    explanation: "Снижено ниже лучшего конкурента",
    icon: TrendingDown,
    className: "reason-UNDERCUT",
  },
  AT_MIN: {
    label: "Минимальный порог",
    explanation: "Сработал защитный пол цены",
    icon: ShieldAlert,
    className: "reason-AT_MIN",
  },
  AT_MAX: {
    label: "Максимальный лимит",
    explanation: "Конкуренты сильно дороже потолка",
    icon: ArrowUpRight,
    className: "reason-AT_MAX",
  },
  NO_COMPETITORS: {
    label: "Нет конкурентов",
    explanation: "Монополия: никого нет в наличии",
    icon: UserX,
    className: "reason-NO_COMPETITORS",
  },
};

function formatTenge(num: number): string {
  return (
    new Intl.NumberFormat("ru-KZ", {
      maximumFractionDigits: 0,
    }).format(num) + " ₸"
  );
}

export function ProductCardGrid({
  rows,
  onInspect,
  onDeleteProduct,
}: ProductCardGridProps) {
  const { canManageProducts } = useAuth();
  const [copiedSku, setCopiedSku] = React.useState<string | null>(null);

  const handleCopy = (sku: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 1500);
  };

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="product-cards-grid">
      {rows.map((row) => {
        const brandInfo = getProductBrandInfo(row.sku, row.name);
        const BrandLogo = brandInfo.logo;

        const oldPrice = row.result ? row.result.oldPrice : row.myPrice;
        const newPrice = row.result ? row.result.newPrice : null;
        const reason = row.result?.reason;
        const reasonMeta = reason ? REASON_CONFIG[reason] : null;
        const ReasonIcon = reasonMeta ? reasonMeta.icon : null;

        const delta = newPrice !== null ? newPrice - oldPrice : 0;
        const deltaPct =
          newPrice !== null && oldPrice > 0
            ? ((delta / oldPrice) * 100).toFixed(1)
            : "0.0";

        let gaugePct = 50;
        if (newPrice !== null && row.maxPrice > row.minPrice) {
          gaugePct = Math.min(
            100,
            Math.max(
              0,
              ((newPrice - row.minPrice) / (row.maxPrice - row.minPrice)) * 100
            )
          );
        }

        const inStockCompetitors = row.competitors.filter((c) => c.inStock);

        return (
          <div
            key={row.sku}
            className="product-card"
            onClick={() => onInspect(row)}
          >
            {/* Card Header: Brand, SKU, and Category */}
            <div className="product-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  className="brand-logo-badge"
                  style={{ background: brandInfo.badgeBg, color: brandInfo.badgeColor }}
                >
                  <BrandLogo size={18} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="sku-badge">{row.sku}</span>
                    <button
                      className="btn-ghost"
                      style={{ padding: "2px", color: "var(--text-muted)" }}
                      onClick={(e) => handleCopy(row.sku, e)}
                      title="Скопировать артикул"
                    >
                      {copiedSku === row.sku ? (
                        <Check size={12} color="#10B981" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>
                  <span className="card-category">{brandInfo.category}</span>
                </div>
              </div>

              {canManageProducts && (
                <button
                  className="btn btn-ghost"
                  style={{ padding: "4px", color: "var(--text-muted)" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProduct(row.sku);
                  }}
                  title="Удалить товар"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Product Title */}
            <h3 className="product-card-title">{row.name}</h3>

            {/* Repricing Box: Было ➔ Стало */}
            <div className="price-compare-card">
              <div className="price-compare-header">
                <span>Ценообразование бота</span>
                <span className="step-pill">Шаг: {row.step} ₸</span>
              </div>

              <div className="price-compare-values">
                <div className="price-old-col">
                  <span className="price-label">Было (myPrice)</span>
                  <span className="price-old-val">{formatTenge(oldPrice)}</span>
                </div>

                <div className="price-arrow-wrapper">
                  <ArrowRight size={18} />
                </div>

                <div className="price-new-col">
                  <span className="price-label">Стало (newPrice)</span>
                  <span className="price-new-val">
                    {newPrice !== null ? formatTenge(newPrice) : "—"}
                  </span>
                </div>
              </div>

              {/* Delta Tag */}
              {newPrice !== null && (
                <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    className={`price-delta ${
                      delta < 0
                        ? "negative"
                        : delta > 0
                        ? "positive"
                        : "neutral"
                    }`}
                  >
                    {delta < 0 ? "▼" : delta > 0 ? "▲" : "="}{" "}
                    {delta > 0 ? `+${delta.toLocaleString("ru-KZ")}` : delta.toLocaleString("ru-KZ")} ₸ ({deltaPct}%)
                  </span>

                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {delta < 0 ? "Снижение цены" : delta > 0 ? "Повышение цены" : "Без изменений"}
                  </span>
                </div>
              )}
            </div>

            {/* Reason Badge with Explanation */}
            {reasonMeta && (
              <div className={`card-reason-banner ${reasonMeta.className}`}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {ReasonIcon && <ReasonIcon size={14} />}
                  <strong>{reason}</strong>
                </div>
                <div style={{ fontSize: "11px", opacity: 0.9 }}>
                  {reasonMeta.explanation}
                </div>
              </div>
            )}

            {/* Margin Safety Gauge */}
            <div className="card-limits-section">
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", color: "var(--text-secondary)" }}>
                <span>Min: {formatTenge(row.minPrice)}</span>
                <span>Max: {formatTenge(row.maxPrice)}</span>
              </div>
              <div className="margin-gauge-track" style={{ marginTop: "6px" }}>
                <div
                  className="margin-gauge-fill"
                  style={{
                    width: `${gaugePct}%`,
                    backgroundColor:
                      reason === "AT_MIN"
                        ? "var(--color-min)"
                        : reason === "AT_MAX"
                        ? "var(--color-max)"
                        : reason === "NO_COMPETITORS"
                        ? "var(--color-none)"
                        : "var(--color-undercut)",
                  }}
                ></div>
              </div>
            </div>

            {/* Competitors Preview */}
            <div className="card-competitors-preview">
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: "6px" }}>
                <span style={{ color: "var(--text-muted)" }}>Конкуренты:</span>
                <span style={{ color: "#10B981", fontWeight: 600 }}>
                  {inStockCompetitors.length} из {row.competitors.length} в наличии
                </span>
              </div>

              <div className="competitor-mini-tags">
                {row.competitors.length === 0 ? (
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Нет конкурентов (монополия)
                  </span>
                ) : (
                  row.competitors.slice(0, 3).map((c, i) => (
                    <span
                      key={i}
                      className={`competitor-mini-chip ${!c.inStock ? "oos" : ""}`}
                    >
                      <span>{c.seller}</span>
                      <strong>{formatTenge(c.price)}</strong>
                    </span>
                  ))
                )}
                {row.competitors.length > 3 && (
                  <span className="competitor-mini-chip">+{row.competitors.length - 3}</span>
                )}
              </div>
            </div>

            {/* Footer action */}
            <button
              className="btn btn-secondary card-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                onInspect(row);
              }}
            >
              <Sliders size={13} />
              <span>What-If Симулятор</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
