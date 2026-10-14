import React from "react";
import { X, History, Trash2, CheckCircle2 } from "lucide-react";
import type { AuditLogEntry } from "../types";

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogEntry[];
  onClearLogs: () => void;
}

export function AuditLogModal({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}: AuditLogModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <History size={18} color="var(--brand-kaspi)" />
            <div className="modal-title">Журнал аудита пересчёта цен</div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {logs.length === 0 ? (
            <div className="empty-state">
              <History className="empty-state-icon" />
              <div>История пересчёта пуста</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                Нажмите «Пересчитать» или запустите «Авто-пилот», чтобы записать события
              </div>
            </div>
          ) : (
            <div className="timeline">
              {logs.map((log) => {
                const delta = log.newPrice - log.oldPrice;
                return (
                  <div key={log.id} className="timeline-item">
                    <div className="timeline-time">{log.timestamp}</div>
                    <div className="timeline-content">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "4px",
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>
                          <span style={{ color: "#38BDF8", fontFamily: "var(--font-mono)", marginRight: "6px" }}>
                            {log.sku}
                          </span>
                          <span>{log.productName}</span>
                        </div>
                        <span className={`reason-badge reason-${log.reason}`}>
                          {log.reason}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: "12.5px",
                          color: "var(--text-secondary)",
                          display: "flex",
                          gap: "12px",
                          alignItems: "center",
                        }}
                      >
                        <span>
                          {log.oldPrice.toLocaleString("ru-KZ")} ₸ →{" "}
                          <strong style={{ color: "var(--text-primary)" }}>
                            {log.newPrice.toLocaleString("ru-KZ")} ₸
                          </strong>{" "}
                          ({delta > 0 ? `+${delta}` : delta} ₸)
                        </span>
                        <span>•</span>
                        <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                          Инициатор: {log.triggeredBy}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {logs.length > 0 && (
            <button
              className="btn btn-secondary"
              onClick={onClearLogs}
              style={{ marginRight: "auto" }}
            >
              <Trash2 size={14} />
              <span>Очистить журнал</span>
            </button>
          )}
          <button className="btn btn-primary" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
