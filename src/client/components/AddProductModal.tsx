import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import type { Product, Competitor } from "../types";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newProduct: Product) => void;
}

export function AddProductModal({ isOpen, onClose, onAdd }: AddProductModalProps) {
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [myPrice, setMyPrice] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [step, setStep] = useState("10");
  const [competitors, setCompetitors] = useState<Competitor[]>([]);

  // Draft competitor
  const [compSeller, setCompSeller] = useState("");
  const [compPrice, setCompPrice] = useState("");
  const [compInStock, setCompInStock] = useState(true);

  if (!isOpen) return null;

  const handleAddCompetitor = () => {
    const p = Number(compPrice);
    if (!compSeller.trim() || isNaN(p) || p <= 0) {
      alert("Укажите имя продавца и положительную цену");
      return;
    }
    setCompetitors([
      ...competitors,
      { seller: compSeller.trim(), price: p, inStock: compInStock },
    ]);
    setCompSeller("");
    setCompPrice("");
    setCompInStock(true);
  };

  const handleRemoveCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const myP = Number(myPrice);
    const minP = Number(minPrice);
    const maxP = Number(maxPrice);
    const s = Number(step);

    if (!sku.trim() || !name.trim()) {
      alert("Заполните SKU и название товара");
      return;
    }

    if (isNaN(myP) || isNaN(minP) || isNaN(maxP) || isNaN(s)) {
      alert("Все цены и шаг должны быть числами");
      return;
    }

    if (minP > maxP) {
      alert("Минимальная цена (minPrice) не может превышать максимальную (maxPrice)");
      return;
    }

    const newProduct: Product = {
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      myPrice: myP,
      minPrice: minP,
      maxPrice: maxP,
      step: s,
      competitors,
    };

    onAdd(newProduct);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Добавить новый товар в мониторинг</div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Артикул (SKU) *</label>
                <input
                  type="text"
                  required
                  placeholder="IPH16-PRO"
                  className="form-input"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Название товара *</label>
                <input
                  type="text"
                  required
                  placeholder="Apple iPhone 16 Pro 256Gb"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Текущая цена (myPrice ₸) *</label>
                <input
                  type="number"
                  required
                  placeholder="550000"
                  className="form-input"
                  value={myPrice}
                  onChange={(e) => setMyPrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Шаг демпинга (step ₸) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="10"
                  className="form-input"
                  value={step}
                  onChange={(e) => setStep(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Мин. цена (minPrice ₸) *</label>
                <input
                  type="number"
                  required
                  placeholder="500000"
                  className="form-input"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Макс. цена (maxPrice ₸) *</label>
                <input
                  type="number"
                  required
                  placeholder="600000"
                  className="form-input"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Competitors */}
            <div style={{ marginTop: "12px" }}>
              <div className="form-label">Конкуренты ({competitors.length}):</div>
              {competitors.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 10px",
                    background: "var(--bg-surface)",
                    borderRadius: "6px",
                    marginBottom: "6px",
                    fontSize: "12.5px",
                  }}
                >
                  <div>
                    <strong>{c.seller}</strong> — {c.price.toLocaleString("ru-KZ")} ₸
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "11px",
                        color: c.inStock ? "#10B981" : "#F87171",
                      }}
                    >
                      {c.inStock ? "В наличии" : "Нет в наличии"}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ padding: "2px" }}
                    onClick={() => handleRemoveCompetitor(i)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  marginTop: "8px",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="text"
                  placeholder="Имя конкурента"
                  className="form-input"
                  style={{ flex: 2, minWidth: "120px", padding: "6px 10px", fontSize: "12px" }}
                  value={compSeller}
                  onChange={(e) => setCompSeller(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Цена ₸"
                  className="form-input"
                  style={{ flex: 1, minWidth: "90px", padding: "6px 10px", fontSize: "12px" }}
                  value={compPrice}
                  onChange={(e) => setCompPrice(e.target.value)}
                />
                <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                  <input
                    type="checkbox"
                    checked={compInStock}
                    onChange={(e) => setCompInStock(e.target.checked)}
                  />
                  <span>В наличии</span>
                </label>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: "6px 10px", fontSize: "12px" }}
                  onClick={handleAddCompetitor}
                >
                  <Plus size={13} />
                  <span>Добавить</span>
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary">
              Создать товар
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
