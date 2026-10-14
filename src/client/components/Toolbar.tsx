import React from "react";
import {
  Search,
  Plus,
  Code,
  Download,
  RotateCcw,
  RefreshCw,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export type ViewMode = "table" | "grid";

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
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
}

const FILTERS: { key: string; label: string; countKey: keyof ToolbarProps["counts"] }[] = [
  { key: "ALL", label: "Все", countKey: "total" },
  { key: "UNDERCUT", label: "UNDERCUT", countKey: "undercut" },
  { key: "AT_MIN", label: "AT_MIN", countKey: "atMin" },
  { key: "AT_MAX", label: "AT_MAX", countKey: "atMax" },
  { key: "NO_COMPETITORS", label: "NO_COMPETITORS", countKey: "noCompetitors" },
];

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
  viewMode,
  onChangeViewMode,
}: ToolbarProps) {
  const { canReprice, canManageProducts, canExport } = useAuth();

  return (
    <div className="toolbar">
      {/* Строка 1: что показывать — поиск и фильтры */}
      <div className="toolbar-row">
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input
            id="search-input"
            type="text"
            className="search-input"
            placeholder="Поиск по SKU или названию..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="filter-chips">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              id={`filter-${f.key.toLowerCase()}`}
              className={`filter-chip ${selectedReason === f.key ? "active" : ""}`}
              onClick={() => onSelectReason(f.key)}
            >
              {f.label}
              <span className="chip-count">{counts[f.countKey]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Строка 2: действия слева, вид отображения справа */}
      <div className="toolbar-row">
        <div className="toolbar-actions">
          {canManageProducts && (
            <button id="btn-add-product" className="btn btn-secondary" onClick={onOpenAddModal}>
              <Plus size={15} />
              <span>Добавить товар</span>
            </button>
          )}

          <button id="btn-json" className="btn btn-secondary" onClick={onOpenJsonModal}>
            <Code size={15} />
            <span>JSON</span>
          </button>

          {canExport && (
            <button id="btn-export" className="btn btn-secondary" onClick={onExportCsv}>
              <Download size={15} />
              <span>Экспорт</span>
            </button>
          )}

          {canManageProducts && (
            <button
              id="btn-reset"
              className="btn btn-secondary"
              onClick={onResetToDemo}
              title="Сбросить к исходным 6 демо-товарам"
            >
              <RotateCcw size={15} />
              <span>Сброс</span>
            </button>
          )}

          <button
            id="btn-reprice"
            className="btn btn-primary"
            onClick={onReprice}
            disabled={isLoading || !canReprice}
            title={
              canReprice
                ? "Пересчитать цены через POST /reprice"
                : "Пересчет доступен только для Admin или Analyst"
            }
          >
            <RefreshCw size={15} />
            <span>{isLoading ? "Расчет..." : "Пересчитать"}</span>
          </button>
        </div>

        <div className="view-mode-toggle" role="group" aria-label="Вид отображения">
          <button
            id="view-table"
            className={`view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
            onClick={() => onChangeViewMode("table")}
            aria-pressed={viewMode === "table"}
          >
            <TableIcon size={14} />
            <span>Таблица</span>
          </button>
          <button
            id="view-grid"
            className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => onChangeViewMode("grid")}
            aria-pressed={viewMode === "grid"}
          >
            <LayoutGrid size={14} />
            <span>Карточки</span>
          </button>
        </div>
      </div>
    </div>
  );
}
