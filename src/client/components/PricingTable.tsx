import React from "react";
import {
  Copy,
  Check,
  Sliders,
  Trash2,
  ArrowUpDown,
  Search,
} from "lucide-react";
import type { ProductRow, SortConfig, Reason } from "../types";
import { useAuth } from "../context/AuthContext";

interface PricingTableProps {
  rows: ProductRow[];
  sortConfig: SortConfig;
  onSort: (key: SortConfig["key"]) => void;
  onInspect: (product: ProductRow) => void;
  onDeleteProduct: (sku: string) => void;
}

const REASON_LABELS: Record<Reason, { label: string; tooltip: string; badgeClass: string }> = {
  UNDERCUT: {
    label: "UNDERCUT",
    tooltip: "Победа в Buy Box: цена установлена на шаг (step) ниже лучшего конкурента",
    badgeClass: "reason-UNDERCUT",
  },
  AT_MIN: {
    label: "AT_MIN",
    tooltip: "Достигнут минимальный порог (minPrice). Защита от работы в убыток",
    badgeClass: "reason-AT_MIN",
  },
  AT_MAX: {
    label: "AT_MAX",
    tooltip: "Конкуренты сильно дороже maxPrice. Выставлен максимальный потолок цены",
    badgeClass: "reason-AT_MAX",
  },
  NO_COMPETITORS: {
    label: "NO_COMPETITORS",
    tooltip: "Нет активных конкурентов в наличии (inStock). Выставлен максимум",
    badgeClass: "reason-NO_COMPETITORS",
  },
};

function formatTenge(num: number): string {
  return (
    new Intl.NumberFormat("ru-KZ", {
      maximumFractionDigits: 2,
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
  const [copiedSku, setCopiedSku] = React.useState<string | null>(null);

  const handleCopy = (sku: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 1500);
  };

  return (
    <div className="table-container">
      <table className="pricing-table">
        <thead>
          <tr>
            <th onClick={() => onSort("sku")}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>SKU</span>
                <ArrowUpDown size={13} opacity={sortConfig.key === "sku" ? 1 : 0.4} />
              </div>
            </th>
            <th onClick={() => onSort("name")}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Товар</span>
                <ArrowUpDown size={13} opacity={sortConfig.key === "name" ? 1 : 0.4} />
              </div>
            </th>
            <th>Диапазон [Min — Max]</th>
            <th onClick={() => onSort("oldPrice")}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Было (myPrice)</span>
                <ArrowUpDown size={13} opacity={sortConfig.key === "oldPrice" ? 1 : 0.4} />
              </div>
            </th>
            <th onClick={() => onSort("newPrice")}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Стало (newPrice)</span>
                <ArrowUpDown size={13} opacity={sortConfig.key === "newPrice" ? 1 : 0.4} />
              </div>
            </th>
            <th onClick={() => onSort("delta")}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Изменение</span>
                <ArrowUpDown size={13} opacity={sortConfig.key === "delta" ? 1 : 0.4} />
              </div>
            </th>
            <th onClick={() => onSort("reason")}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Причина</span>
                <ArrowUpDown size={13} opacity={sortConfig.key === "reason" ? 1 : 0.4} />
              </div>
            </th>
            <th style={{ textAlign: "right" }}>Конкуренты / Действия</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8}>
                <div className="empty-state">
                  <Search className="empty-state-icon" />
                  <div style={{ fontWeight: 600 }}>Ничего не найдено</div>
                  <div style={{ fontSize: "12.5px", marginTop: "4px" }}>
                    Попробуйте изменить поисковый запрос или сбросить фильтры
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const oldPrice = row.result ? row.result.oldPrice : row.myPrice;
              const newPrice = row.result ? row.result.newPrice : null;
              const reason = row.result?.reason;
              const reasonMeta = reason ? REASON_LABELS[reason] : null;

              const delta = newPrice !== null ? newPrice - oldPrice : 0;
              const deltaPct =
                newPrice !== null && oldPrice > 0
                  ? ((delta / oldPrice) * 100).toFixed(1)
                  : "0.0";

              // Вычисление процента заполнения диапазона [min, max]
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

              const inStockCount = row.competitors.filter((c: any) => c.inStock).length;

              return (
                <tr
                  key={row.sku}
                  className="table-row"
                  onClick={() => onInspect(row)}
                  style={{ cursor: "pointer" }}
                >
                  {/* SKU */}
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
                          <Check size={13} color="#10B981" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Название */}
                  <td>
                    <div className="product-name">{row.name}</div>
                    <div className="product-limits">
                      <span>Шаг: {row.step} ₸</span>
                    </div>
                  </td>

                  {/* Диапазон [min - max] & шкала безопасности */}
                  <td>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
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
                                  : "var(--color-undercut)",
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Было */}
                  <td>
                    <span className="price-cell price-old">
                      {formatTenge(oldPrice)}
                    </span>
                  </td>

                  {/* Стало */}
                  <td>
                    <span className="price-cell price-new">
                      {newPrice !== null ? formatTenge(newPrice) : "—"}
                    </span>
                  </td>

                  {/* Изменение */}
                  <td>
                    {newPrice !== null ? (
                      <span
                        className={`price-delta ${
                          delta < 0
                            ? "negative"
                            : delta > 0
                            ? "positive"
                            : "neutral"
                        }`}
                      >
                        {delta > 0 ? `+${delta}` : delta} ₸ ({deltaPct}%)
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* Причина */}
                  <td>
                    {reasonMeta ? (
                      <span
                        className={`reason-badge ${reasonMeta.badgeClass}`}
                        title={reasonMeta.tooltip}
                      >
                        {reason}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* Действия & Конкуренты */}
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
                        onClick={() => onInspect(row)}
                        title="Открыть симулятор конкурентов и редактирование"
                      >
                        <Sliders size={13} />
                        <span>
                          {inStockCount}/{row.competitors.length} в наличии
                        </span>
                      </button>

                      {canManageProducts && (
                        <button
                          className="btn btn-ghost"
                          style={{
                            padding: "6px",
                            color: "var(--text-muted)",
                          }}
                          onClick={() => onDeleteProduct(row.sku)}
                          title="Удалить товар"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
