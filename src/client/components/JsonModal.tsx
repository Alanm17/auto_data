import React, { useState, useEffect } from "react";
import { X, Copy, Check, Code } from "lucide-react";
import type { Product } from "../types";

interface JsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onApply: (updatedProducts: Product[]) => void;
}

export function JsonModal({
  isOpen,
  onClose,
  products,
  onApply,
}: JsonModalProps) {
  const [jsonString, setJsonString] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setJsonString(JSON.stringify(products, null, 2));
      setErrorMsg(null);
    }
  }, [isOpen, products]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        throw new Error("Корневой элемент должен быть массивом Product[]");
      }
      onApply(parsed);
      onClose();
    } catch (e) {
      setErrorMsg("Ошибка JSON: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Code size={18} color="#38BDF8" />
            <div className="modal-title">Редактор каталога товаров (JSON)</div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
              Вы можете скопировать или отредактировать массив товаров:
            </span>
            <button
              className="btn btn-secondary"
              style={{ padding: "4px 8px", fontSize: "12px" }}
              onClick={handleCopy}
            >
              {isCopied ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
              <span>{isCopied ? "Скопировано!" : "Копировать JSON"}</span>
            </button>
          </div>

          {errorMsg && (
            <div
              style={{
                padding: "8px 12px",
                background: "rgba(239, 68, 68, 0.15)",
                color: "#F87171",
                borderRadius: "6px",
                fontSize: "12.5px",
                marginBottom: "10px",
              }}
            >
              {errorMsg}
            </div>
          )}

          <textarea
            className="json-textarea"
            value={jsonString}
            onChange={(e) => {
              setJsonString(e.target.value);
              setErrorMsg(null);
            }}
          />
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Отмена
          </button>
          <button className="btn btn-primary" onClick={handleApply}>
            Применить и пересчитать
          </button>
        </div>
      </div>
    </div>
  );
}
