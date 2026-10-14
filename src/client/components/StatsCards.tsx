import React from "react";
import {
  Layers,
  TrendingDown,
  ShieldAlert,
  ArrowUpRight,
  UserX,
  Percent,
} from "lucide-react";
import type { ProductRow } from "../types";

interface StatsCardsProps {
  rows: ProductRow[];
}

export function StatsCards({ rows }: StatsCardsProps) {
  const total = rows.length;
  let undercut = 0;
  let atMin = 0;
  let atMax = 0;
  let noCompetitors = 0;

  rows.forEach((row) => {
    const reason = row.result?.reason;
    if (reason === "UNDERCUT") undercut++;
    else if (reason === "AT_MIN") atMin++;
    else if (reason === "AT_MAX") atMax++;
    else if (reason === "NO_COMPETITORS") noCompetitors++;
  });

  const winRate = total > 0 ? Math.round(((undercut + noCompetitors) / total) * 100) : 0;

  const pctUndercut = total > 0 ? (undercut / total) * 100 : 0;
  const pctAtMin = total > 0 ? (atMin / total) * 100 : 0;
  const pctAtMax = total > 0 ? (atMax / total) * 100 : 0;
  const pctNoComp = total > 0 ? (noCompetitors / total) * 100 : 0;

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* 6 KPI Cards Grid */}
      <div className="stats-grid">
        {/* 1. Всего товаров */}
        <div className="stat-card stat-card-total">
          <div className="stat-header">
            <span>Всего товаров</span>
            <div className="stat-icon-wrapper" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38BDF8" }}>
              <Layers size={16} />
            </div>
          </div>
          <div className="stat-value">{total}</div>
          <div className="stat-desc">Товаров в мониторинге</div>
        </div>

        {/* 2. UNDERCUT */}
        <div className="stat-card stat-card-undercut">
          <div className="stat-header">
            <span style={{ color: "var(--color-undercut)" }}>1-е место (UNDERCUT)</span>
            <div className="stat-icon-wrapper" style={{ background: "var(--color-undercut-bg)", color: "var(--color-undercut)" }}>
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="stat-value" style={{ color: "var(--color-undercut)" }}>
            {undercut}
          </div>
          <div className="stat-desc">Выигрывают ценовую гонку</div>
        </div>

        {/* 3. AT_MIN */}
        <div className="stat-card stat-card-min">
          <div className="stat-header">
            <span style={{ color: "var(--color-min)" }}>Порог (AT_MIN)</span>
            <div className="stat-icon-wrapper" style={{ background: "var(--color-min-bg)", color: "var(--color-min)" }}>
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="stat-value" style={{ color: "var(--color-min)" }}>
            {atMin}
          </div>
          <div className="stat-desc">Защита маржинальности</div>
        </div>

        {/* 4. AT_MAX */}
        <div className="stat-card stat-card-max">
          <div className="stat-header">
            <span style={{ color: "var(--color-max)" }}>Потолок (AT_MAX)</span>
            <div className="stat-icon-wrapper" style={{ background: "var(--color-max-bg)", color: "var(--color-max)" }}>
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="stat-value" style={{ color: "var(--color-max)" }}>
            {atMax}
          </div>
          <div className="stat-desc">Конкуренты сильно дороже</div>
        </div>

        {/* 5. NO_COMPETITORS */}
        <div className="stat-card stat-card-none">
          <div className="stat-header">
            <span style={{ color: "var(--color-none)" }}>Без конкурентов</span>
            <div className="stat-icon-wrapper" style={{ background: "var(--color-none-bg)", color: "var(--color-none)" }}>
              <UserX size={16} />
            </div>
          </div>
          <div className="stat-value" style={{ color: "var(--color-none)" }}>
            {noCompetitors}
          </div>
          <div className="stat-desc">Монополия (нет в наличии)</div>
        </div>

        {/* 6. Buy Box Win Rate */}
        <div className="stat-card stat-card-rate">
          <div className="stat-header">
            <span style={{ color: "#F43F5E" }}>Buy Box Win Rate</span>
            <div className="stat-icon-wrapper" style={{ background: "rgba(244, 63, 94, 0.15)", color: "#F43F5E" }}>
              <Percent size={16} />
            </div>
          </div>
          <div className="stat-value" style={{ color: "#F43F5E" }}>
            {winRate}%
          </div>
          <div className="stat-desc">Лидерство на витрине Kaspi</div>
        </div>
      </div>

      {/* Colorful Segmented Catalog Distribution Bar */}
      {total > 0 && (
        <div className="distribution-bar-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", fontSize: "12px" }}>
            <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
              Распределение каталога по статусам ценообразования:
            </span>
            <div style={{ display: "flex", gap: "16px", fontSize: "11.5px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span className="dist-legend-dot" style={{ background: "var(--color-undercut)" }}></span>
                UNDERCUT ({pctUndercut.toFixed(0)}%)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span className="dist-legend-dot" style={{ background: "var(--color-min)" }}></span>
                AT_MIN ({pctAtMin.toFixed(0)}%)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span className="dist-legend-dot" style={{ background: "var(--color-max)" }}></span>
                AT_MAX ({pctAtMax.toFixed(0)}%)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span className="dist-legend-dot" style={{ background: "var(--color-none)" }}></span>
                NO_COMP ({pctNoComp.toFixed(0)}%)
              </span>
            </div>
          </div>

          <div className="segmented-distribution-bar">
            {pctUndercut > 0 && (
              <div
                style={{ width: `${pctUndercut}%`, background: "var(--color-undercut)" }}
                title={`UNDERCUT: ${undercut} тов. (${pctUndercut.toFixed(1)}%)`}
              />
            )}
            {pctAtMin > 0 && (
              <div
                style={{ width: `${pctAtMin}%`, background: "var(--color-min)" }}
                title={`AT_MIN: ${atMin} тов. (${pctAtMin.toFixed(1)}%)`}
              />
            )}
            {pctAtMax > 0 && (
              <div
                style={{ width: `${pctAtMax}%`, background: "var(--color-max)" }}
                title={`AT_MAX: ${atMax} тов. (${pctAtMax.toFixed(1)}%)`}
              />
            )}
            {pctNoComp > 0 && (
              <div
                style={{ width: `${pctNoComp}%`, background: "var(--color-none)" }}
                title={`NO_COMPETITORS: ${noCompetitors} тов. (${pctNoComp.toFixed(1)}%)`}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
