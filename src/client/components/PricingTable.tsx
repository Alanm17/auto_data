import React, { useState } from "react";
import {
  Copy,
  Check,
  Sliders,
  Trash2,
  ArrowUpDown,
  Search,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  ArrowUpRight,
  UserX,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { ProductRow, SortConfig, Reason } from "../types";
import { useAuth } from "../context/AuthContext";
import { getProductBrandInfo } from "./BrandIcons";

interface PricingTableProps {
  rows: ProductRow[];
  sortConfig: SortConfig;
  onSort: (key: SortConfig["key"]) => void;
  onInspect: (product: ProductRow) => void;
  onDeleteProduct: (sku: string) => void;
}

const REASON_CONFIG: Record<
  Reason,
  { label: string; explanation: string; icon: any; className: string }
> = {
  UNDERCUT: {
    label: "UNDERCUT",
    explanation: "Победа в Buy Box (-1 шаг)",
    icon: TrendingDown,
    className: "reason-UNDERCUT",
  },
  AT_MIN: {
    label: "AT_MIN",
    explanation: "Защита маржинальности",
    icon: ShieldAlert,
    className: "reason-AT_MIN",
  },
  AT_MAX: {
    label: "AT_MAX",
    explanation: "Потолок максимальной цены",
    icon: ArrowUpRight,
    className: "reason-AT_MAX",
  },
  NO_COMPETITORS: {
    label: "NO_COMPETITORS",
    explanation: "Монополия (нет в наличии)",
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

export function PricingTable({
  rows,
  sortConfig,
  onSort,
  onInspect,
  onDeleteProduct,
}: PricingTableProps) {
  const { canManageProducts } = useAuth();
  const [copiedSku, setCopiedSku] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const handleCopy = (sku: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 1500);
  };

  const toggleExpandRow = (sku: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRows((prev) => ({ ...prev, [sku]: !prev[sku] }));
  };

  return (
    <div className="table-container">
      <table className="pricing-table">
        <thead>
          <tr>
            <th onClick={() => onSort("name")} style={{ width: "32%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Товар и Артикул (SKU)</span>
                <ArrowUpDown size={13} opacity={sortConfig.key === "name" ? 1 : 0.4} />
              </div>
            </th>
            <th onClick={() => onSort("newPrice")} style={{ width: "24%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Ценообразование: «Было ➔ Стало»</span>
                <ArrowUpDown size={13} opacity={sortConfig.key === "newPrice" ? 1 : 0.4} />
              </div>
            </th>
            <th style={{ width: "16%" }}>
              <span>Пороги [Min — Max]</span>
            </th>
            <th onClick={() => onSort("reason")} style={{ width: "16%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Причина решения</span>
                <ArrowUpDown size={13} opacity={sortConfig.key === "reason" ? 1 : 0.4} />
              </div>
            </th>
            <th style={{ textAlign: "right", width: "12%" }}>Конкуренты</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <div className="empty-state">
                  <Search className="empty-state-icon" />
                  <div style={{ fontWeight: 600 }}>Ничего не найдено</div>
                  <div style={{ fontSize: "12.5px", marginTop: "4px" }}>
                    Попробуйте изменить поисковый запрос или фильтры
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row) => {
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

              const isExpanded = !!expandedRows[row.sku];
              const inStockCompetitors = row.competitors.filter((c: any) => c.inStock);

              return (
                <React.Fragment key={row.sku}>
                  <tr
                    className="table-row"
                    onClick={() => onInspect(row)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* 1. Товар & Артикул (Rich Product Identity) */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          className="table-brand-avatar"
                          style={{
                            background: brandInfo.badgeBg,
                            color: brandInfo.badgeColor,
                          }}
                        >
                          <BrandLogo size={20} />
                        </div>
                        <div>
                          <div className="product-name">{row.name}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <span className="sku-badge">{row.sku}</span>
                              <button
                                onClick={(e) => handleCopy(row.sku, e)}
                                title="Скопировать артикул"
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "var(--text-muted)",
                                  cursor: "pointer",
                                  padding: "2px",
                                }}
                              >
                                {copiedSku === row.sku ? (
                                  <Check size={12} color="#10B981" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                            <span className="step-pill">Шаг: {row.step} ₸</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Ценообразование: «Было ➔ Стало» */}
                    <td>
                      <div className="table-price-block">
                        <div className="table-price-row">
                          <span className="table-price-old">{formatTenge(oldPrice)}</span>
                          <ArrowRight size={14} className="table-price-arrow" />
                          <span className="table-price-new">
                            {newPrice !== null ? formatTenge(newPrice) : "—"}
                          </span>
                        </div>
                        {newPrice !== null && (
                          <div style={{ marginTop: "4px" }}>
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
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 3. Пороги [Min — Max] + Margin Gauge */}
                    <td>
                      <div>
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>
                          {formatTenge(row.minPrice)} — {formatTenge(row.maxPrice)}
                        </div>
                        {newPrice !== null && (
                          <div className="margin-gauge-container" title={`Позиция цены: ${gaugePct.toFixed(0)}% диапазона`}>
                            <div className="margin-gauge-track">
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
                        )}
                      </div>
                    </td>

                    {/* 4. Причина решения */}
                    <td>
                      {reasonMeta ? (
                        <div>
                          <span className={`reason-badge ${reasonMeta.className}`}>
                            {ReasonIcon && <ReasonIcon size={13} />}
                            <span>{reason}</span>
                          </span>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                            {reasonMeta.explanation}
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* 5. Конкуренты & Действия */}
                    <td style={{ textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: "8px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "4px 10px", fontSize: "12px" }}
                          onClick={(e) => toggleExpandRow(row.sku, e)}
                          title="Показать / скрыть конкурентов"
                        >
                          <span>
                            {inStockCompetitors.length}/{row.competitors.length}
                          </span>
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>

                        <button
                          className="btn btn-secondary"
                          style={{ padding: "4px 8px" }}
                          onClick={() => onInspect(row)}
                          title="Открыть What-If симулятор"
                        >
                          <Sliders size={13} />
                        </button>

                        {canManageProducts && (
                          <button
                            className="btn btn-ghost"
                            style={{ padding: "4px", color: "var(--text-muted)" }}
                            onClick={() => onDeleteProduct(row.sku)}
                            title="Удалить товар"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Competitors Inline Breakdown */}
                  {isExpanded && (
                    <tr className="expanded-competitors-row">
                      <td colSpan={5} style={{ padding: 0 }}>
                        <div className="table-competitors-drawer">
                          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
                            Конкуренты на Kaspi.kz для {row.name}:
                          </div>
                          {row.competitors.length === 0 ? (
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                              Конкуренты не найдены. Товар продаётся в режиме монополии.
                            </div>
                          ) : (
                            <div className="competitors-grid">
                              {row.competitors.map((c: any, idx: number) => {
                                const diffWithNew = newPrice !== null ? c.price - newPrice : 0;
                                return (
                                  <div
                                    key={idx}
                                    className={`competitor-card ${!c.inStock ? "out-of-stock" : ""}`}
                                  >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <strong>{c.seller}</strong>
                                      <span
                                        style={{
                                          padding: "1px 6px",
                                          borderRadius: "4px",
                                          fontSize: "10px",
                                          fontWeight: 700,
                                          background: c.inStock
                                            ? "rgba(16, 185, 129, 0.15)"
                                            : "rgba(239, 68, 68, 0.15)",
                                          color: c.inStock ? "#34D399" : "#F87171",
                                        }}
                                      >
                                        {c.inStock ? "В НАЛИЧИИ" : "НЕТ В НАЛИЧИИ"}
                                      </span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                                      <span style={{ fontSize: "13px", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                                        {formatTenge(c.price)}
                                      </span>
                                      {c.inStock && newPrice !== null && (
                                        <span style={{ fontSize: "11px", color: diffWithNew >= 0 ? "#10B981" : "#F59E0B" }}>
                                          {diffWithNew >= 0
                                            ? `Мы дешевле на ${diffWithNew.toLocaleString("ru-KZ")} ₸`
                                            : `Они дешевле на ${Math.abs(diffWithNew).toLocaleString("ru-KZ")} ₸`}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
