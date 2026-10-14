import React from "react";
import {
  Search,
  Plus,
  Code,
  Download,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { ProductRow } from "../types";

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedReason: string;
  onSelectReason: (r: string) => void;
  counts: {
    total: number;
    undercut: number;
    atMin: number;
    atMax: number;
    noCompetitors: number;
  };
  isLoading: boolean;
  onReprice: () => void;
  onOpenAddModal: () => void;
  onOpenJsonModal: () => void;
  onResetToDemo: () => void;
  onExportCsv: () => void;
}

export function Toolbar({
  searchQuery,
  onSearchChange,
  selectedReason,
  onSelectReason,
  counts,
  isLoading,
  onReprice,
  onOpenAddModal,
  onOpenJsonModal,
  onResetToDemo,
  onExportCsv,
}: ToolbarProps) {
  const { canEditLimits, canReprice, canManageProducts, canExport } = useAuth();

  return (
    <div className="toolbar">
      {/* Search Input */}
      <div className="search-box">
        <Search size={15} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Поиск по SKU или названию..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filter Chips */}
      <div className="filter-chips">
        <button
          className={`filter-chip ${selectedReason === "ALL" ? "active" : ""}`}
          onClick={() => onSelectReason("ALL")}
        >
          Все
          <span className="chip-count">{counts.total}</span>
        </button>
        <button
          className={`filter-chip ${
            selectedReason === "UNDERCUT" ? "active" : ""
          }`}
          onClick={() => onSelectReason("UNDERCUT")}
        >
          UNDERCUT
          <span className="chip-count">{counts.undercut}</span>
        </button>
        <button
          className={`filter-chip ${
            selectedReason === "AT_MIN" ? "active" : ""
          }`}
          onClick={() => onSelectReason("AT_MIN")}
        >
          AT_MIN
          <span className="chip-count">{counts.atMin}</span>
        </button>
        <button
          className={`filter-chip ${
            selectedReason === "AT_MAX" ? "active" : ""
          }`}
          onClick={() => onSelectReason("AT_MAX")}
        >
          AT_MAX
          <span className="chip-count">{counts.atMax}</span>
        </button>
        <button
          className={`filter-chip ${
            selectedReason === "NO_COMPETITORS" ? "active" : ""
          }`}
          onClick={() => onSelectReason("NO_COMPETITORS")}
        >
          NO_COMPETITORS
          <span className="chip-count">{counts.noCompetitors}</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="toolbar-actions">
        {canManageProducts && (
          <button
            className="btn btn-secondary"
            onClick={onOpenAddModal}
            title="Добавить новый товар в мониторинг"
          >
            <Plus size={15} />
            <span>Добавить товар</span>
          </button>
        )}

        <button
          className="btn btn-secondary"
          onClick={onOpenJsonModal}
          title="Редактировать входной JSON массив"
        >
          <Code size={15} />
          <span>JSON</span>
        </button>

        {canExport && (
          <button
            className="btn btn-secondary"
            onClick={onExportCsv}
            title="Экспорт таблицы «было / стало» в CSV"
          >
            <Download size={15} />
            <span>Экспорт</span>
          </button>
        )}

        {canManageProducts && (
          <button
            className="btn btn-secondary"
            onClick={onResetToDemo}
            title="Сбросить к исходным 6 демо-товарам"
          >
            <RotateCcw size={15} />
            <span>Сброс</span>
          </button>
        )}

        <button
          className="btn btn-primary"
          onClick={onReprice}
          disabled={isLoading || !canReprice}
          title={
            canReprice
              ? "Пересчитать цены через POST /reprice"
              : "Пересчет доступен только для Admin или Analyst"
          }
        >
          <RefreshCw
            size={15}
            className={isLoading ? "animate-spin" : ""}
          />
          <span>{isLoading ? "Расчет..." : "Пересчитать"}</span>
        </button>
      </div>
    </div>
  );
}
