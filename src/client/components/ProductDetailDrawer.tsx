import React, { useState, useEffect } from "react";
import {
  X,
  Sliders,
  Plus,
  Trash2,
  Check,
  TrendingDown,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type { Product, Competitor, PriceResult } from "../types";
import { calculatePrice } from "../../pricing";
import { useAuth } from "../context/AuthContext";

interface ProductDetailDrawerProps {
  product: Product | null;
  onClose: () => void;
  onSave: (updated: Product) => void;
}

export function ProductDetailDrawer({
  product,
  onClose,
  onSave,
}: ProductDetailDrawerProps) {
  const { canEditLimits } = useAuth();

  const [formData, setFormData] = useState<Product | null>(null);
  const [liveResult, setLiveResult] = useState<PriceResult | null>(null);

  // New competitor draft
  const [newSeller, setNewSeller] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newInStock, setNewInStock] = useState(true);

  useEffect(() => {
    if (product) {
      // deep clone for editing
      const cloned = JSON.parse(JSON.stringify(product));
      setFormData(cloned);
      setLiveResult(calculatePrice(cloned));
    } else {
      setFormData(null);
      setLiveResult(null);
    }
  }, [product]);

  if (!formData || !product) return null;

  const updateProductState = (next: Product) => {
    setFormData(next);
    setLiveResult(calculatePrice(next));
  };

  type NumericField = "minPrice" | "maxPrice" | "step" | "myPrice";

  const handleFieldChange = (field: NumericField, value: string) => {
    const num = Number(value);
    if (Number.isNaN(num)) return;
    updateProductState({ ...formData, [field]: num });
  };

  const handleToggleCompetitorStock = (index: number) => {
    const comps = [...formData.competitors];
    comps[index] = { ...comps[index], inStock: !comps[index].inStock };
    updateProductState({ ...formData, competitors: comps });
  };

  const handleUpdateCompetitorPrice = (index: number, newP: number) => {
    const comps = [...formData.competitors];
    comps[index] = { ...comps[index], price: newP };
    updateProductState({ ...formData, competitors: comps });
  };

  const handleDeleteCompetitor = (index: number) => {
    const comps = formData.competitors.filter((_c: Competitor, i: number) => i !== index);
    updateProductState({ ...formData, competitors: comps });
  };

  const handleAddCompetitor = () => {
    const p = Number(newPrice);
    if (!newSeller.trim() || isNaN(p) || p <= 0) {
      alert("Укажите корректное имя продавца и цену");
      return;
    }
    const newComp: Competitor = {
      seller: newSeller.trim(),
      price: p,
      inStock: newInStock,
    };
    const updatedComps = [...formData.competitors, newComp];
    updateProductState({ ...formData, competitors: updatedComps });
    setNewSeller("");
    setNewPrice("");
    setNewInStock(true);
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div>
            <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "#38BDF8" }}>
              {formData.sku}
            </div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              {formData.name}
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: "6px" }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {/* Live Simulator Result Card */}
          {liveResult && (
            <div className="simulator-box">
              <div className="simulator-title">
                <Zap size={15} />
                <span>What-If Симулятор (Live Расчёт)</span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  fontSize: "13px",
                  marginBottom: "10px",
                }}
              >
                <div>
                  <div style={{ color: "var(--text-muted)" }}>Старая цена:</div>
                  <div style={{ fontSize: "16px", fontWeight: 600 }}>
                    {liveResult.oldPrice.toLocaleString("ru-KZ")} ₸
                  </div>
                </div>
                <div>
                  <div style={{ color: "var(--text-muted)" }}>Новая цена:</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#10B981" }}>
                    {liveResult.newPrice.toLocaleString("ru-KZ")} ₸
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Причина:</span>
                <span className={`reason-badge reason-${liveResult.reason}`}>
                  {liveResult.reason}
                </span>
              </div>
            </div>
          )}

          {/* Product Limit Fields */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "12px" }}>
              Параметры ценообразования
              {!canEditLimits && (
                <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--text-muted)", marginLeft: "8px" }}>
                  (Только чтение для вашей роли)
                </span>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Мин. цена (minPrice):</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.minPrice}
                  disabled={!canEditLimits}
                  onChange={(e) => handleFieldChange("minPrice", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Макс. цена (maxPrice):</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.maxPrice}
                  disabled={!canEditLimits}
                  onChange={(e) => handleFieldChange("maxPrice", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Шаг демпинга (step):</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={formData.step}
                  disabled={!canEditLimits}
                  onChange={(e) => handleFieldChange("step", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Текущая цена (myPrice):</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.myPrice}
                  disabled={!canEditLimits}
                  onChange={(e) => handleFieldChange("myPrice", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Competitors List with Live Toggles */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 700 }}>
                Конкуренты ({formData.competitors.length})
              </div>
              <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                Переключайте «в наличии» для теста
              </span>
            </div>

            {formData.competitors.length === 0 ? (
              <div style={{ fontSize: "13px", color: "var(--text-muted)", padding: "12px 0" }}>
                Конкуренты отсутствуют (сработает правило NO_COMPETITORS).
              </div>
            ) : (
              formData.competitors.map((c: Competitor, idx: number) => (
                <div key={idx} className="competitor-edit-row">
                  <input
                    type="checkbox"
                    checked={c.inStock}
                    onChange={() => handleToggleCompetitorStock(idx)}
                    title={c.inStock ? "В наличии" : "Нет в наличии"}
                    style={{ cursor: "pointer", width: "16px", height: "16px" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "12.5px" }}>{c.seller}</div>
                    <span
                      style={{
                        fontSize: "11px",
                        color: c.inStock ? "#10B981" : "#F87171",
                      }}
                    >
                      {c.inStock ? "В наличии (учитывается)" : "Нет в наличии (игнорируется)"}
                    </span>
                  </div>

                  <input
                    type="number"
                    value={c.price}
                    onChange={(e) => handleUpdateCompetitorPrice(idx, Number(e.target.value))}
                    style={{
                      width: "110px",
                      padding: "4px 8px",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "4px",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "12.5px",
                    }}
                  />

                  <button
                    className="btn btn-ghost"
                    style={{ padding: "4px", color: "var(--text-muted)" }}
                    onClick={() => handleDeleteCompetitor(idx)}
                    title="Удалить конкурента"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}

            {/* Add Competitor Draft */}
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-md)",
                border: "1px dashed var(--border-strong)",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>
                Добавить конкурента в симуляцию:
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Продавец (напр. ShopKZ)"
                  className="form-input"
                  style={{ flex: 2, minWidth: "120px", padding: "6px 10px", fontSize: "12px" }}
                  value={newSeller}
                  onChange={(e) => setNewSeller(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Цена ₸"
                  className="form-input"
                  style={{ flex: 1, minWidth: "90px", padding: "6px 10px", fontSize: "12px" }}
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                />
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={newInStock}
                    onChange={(e) => setNewInStock(e.target.checked)}
                  />
                  <span>В наличии</span>
                </label>
                <button
                  className="btn btn-secondary"
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                  onClick={handleAddCompetitor}
                >
                  <Plus size={13} />
                  <span>Добавить</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="drawer-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Отмена
          </button>
          {canEditLimits && (
            <button className="btn btn-primary" onClick={handleSave}>
              <Check size={14} />
              <span>Сохранить в каталог</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
