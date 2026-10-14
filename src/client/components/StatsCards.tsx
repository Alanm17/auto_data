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
  let totalDelta = 0;

  rows.forEach((row) => {
    const reason = row.result?.reason;
    if (reason === "UNDERCUT") undercut++;
    else if (reason === "AT_MIN") atMin++;
    else if (reason === "AT_MAX") atMax++;
    else if (reason === "NO_COMPETITORS") noCompetitors++;

    if (row.result) {
      totalDelta += row.result.newPrice - row.result.oldPrice;
    }
  });

  const winRate = total > 0 ? Math.round(((undercut + noCompetitors) / total) * 100) : 0;

  return (
    <div className="stats-grid">
      {/* 1. Total Products */}
      <div className="stat-card">
        <div className="stat-header">
          <span>Всего товаров</span>
          <Layers size={16} />
        </div>
        <div className="stat-value">{total}</div>
        <div className="stat-desc">Товаров в каталоге</div>
      </div>

      {/* 2. Buy Box Win / Undercut */}
      <div className="stat-card">
        <div className="stat-header" style={{ color: "var(--color-undercut)" }}>
          <span>UNDERCUT (1-е место)</span>
          <TrendingDown size={16} />
        </div>
        <div className="stat-value" style={{ color: "var(--color-undercut)" }}>
          {undercut}
        </div>
        <div className="stat-desc">Опережают конкурентов по цене</div>
      </div>

      {/* 3. At Min */}
      <div className="stat-card">
        <div className="stat-header" style={{ color: "var(--color-min)" }}>
          <span>AT_MIN (Минимум)</span>
          <ShieldAlert size={16} />
        </div>
        <div className="stat-value" style={{ color: "var(--color-min)" }}>
          {atMin}
        </div>
        <div className="stat-desc">Защита маржинальности</div>
      </div>

      {/* 4. At Max */}
      <div className="stat-card">
        <div className="stat-header" style={{ color: "var(--color-max)" }}>
          <span>AT_MAX (Максимум)</span>
          <ArrowUpRight size={16} />
        </div>
        <div className="stat-value" style={{ color: "var(--color-max)" }}>
          {atMax}
        </div>
        <div className="stat-desc">Конкуренты сильно дороже</div>
      </div>

      {/* 5. No Competitors */}
      <div className="stat-card">
        <div className="stat-header" style={{ color: "var(--color-none)" }}>
          <span>NO_COMPETITORS</span>
          <UserX size={16} />
        </div>
        <div className="stat-value" style={{ color: "var(--color-none)" }}>
          {noCompetitors}
        </div>
        <div className="stat-desc">Нет соперников в наличии</div>
      </div>

      {/* 6. Buy Box Win Rate */}
      <div className="stat-card">
        <div className="stat-header" style={{ color: "#38BDF8" }}>
          <span>Buy Box Win Rate</span>
          <Percent size={16} />
        </div>
        <div className="stat-value" style={{ color: "#38BDF8" }}>
          {winRate}%
        </div>
        <div className="stat-desc">Доля лидирующих позиций</div>
      </div>
    </div>
  );
}
