import React, { useState, useRef, useEffect } from "react";
import {
  Moon,
  Sun,
  History,
  ChevronDown,
  Check,
  ShieldCheck,
  UserCheck,
  Eye,
} from "lucide-react";
import { useAuth, PRESET_USERS } from "../context/AuthContext";
import type { UserRole } from "../types";
import { SaleScoutLogo } from "./BrandIcons";

interface NavbarProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  isBotActive: boolean;
  onToggleBot: () => void;
  botCountdown: number;
  onOpenAuditLog: () => void;
  auditCount: number;
}

export function Navbar({
  theme,
  onToggleTheme,
  isBotActive,
  onToggleBot,
  botCountdown,
  onOpenAuditLog,
  auditCount,
}: NavbarProps) {
  const { currentUser, switchRole, canToggleBot } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setIsDropdownOpen(false);
  };

  return (
    <header className="app-header">
      {/* Brand & System Status */}
      <div className="brand-section">
        <div className="brand-icon-wrapper" style={{ padding: 0 }}>
          <SaleScoutLogo size={42} />
        </div>
        <div>
          <div className="brand-title">
            <span style={{ fontWeight: 800 }}>SaleScout</span>
            <span style={{ color: "var(--brand-kaspi)", fontWeight: 700 }}>PriceBot</span>
            <span className="brand-badge">Kaspi.kz Pro</span>
          </div>
          <div className="brand-subtitle">
            <span>Автоматический прайс-бот</span>
            <span>•</span>
            <span className="status-badge">
              <span className="status-dot"></span>
              API Online
            </span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="header-right">
        {/* Auto-pilot bot toggle */}
        <button
          className={`bot-toggle-btn ${isBotActive ? "active" : ""}`}
          onClick={onToggleBot}
          disabled={!canToggleBot}
          title={
            canToggleBot
              ? isBotActive
                ? "Остановить авто-пилот"
                : "Включить авто-пилот (пересчет каждые 15 сек)"
              : "Включение бота доступно только для роли Admin"
          }
        >
          {isBotActive && <span className="bot-pulse"></span>}
          <span>
            {isBotActive ? `Бот активен (${botCountdown}с)` : "🤖 Авто-пилот"}
          </span>
        </button>

        {/* Audit Log button */}
        <button
          className="btn btn-secondary"
          onClick={onOpenAuditLog}
          title="История изменений и журнал аудита"
          style={{ position: "relative" }}
        >
          <History size={15} />
          <span>Журнал</span>
          {auditCount > 0 && (
            <span
              style={{
                background: "var(--brand-kaspi)",
                color: "white",
                fontSize: "10px",
                fontWeight: 700,
                borderRadius: "9999px",
                padding: "1px 6px",
                marginLeft: "2px",
              }}
            >
              {auditCount}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === "dark" ? "Переключить на светлую тему" : "Переключить на темную тему"}
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* RBAC User Profile / Role Switcher */}
        <div className="user-menu" ref={dropdownRef}>
          <button
            className="user-profile-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title="Сменить роль (Admin, Analyst, Auditor)"
          >
            <div className="user-avatar">
              {currentUser.role === "ADMIN" ? (
                <ShieldCheck size={16} />
              ) : currentUser.role === "ANALYST" ? (
                <UserCheck size={16} />
              ) : (
                <Eye size={16} />
              )}
            </div>
            <div className="user-info">
              <div className="user-name">{currentUser.name}</div>
              <span className={`user-role-badge role-${currentUser.role}`}>
                {currentUser.role === "ADMIN"
                  ? "Admin"
                  : currentUser.role === "ANALYST"
                  ? "Analyst"
                  : "Auditor"}
              </span>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  padding: "4px 8px 8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Быстрая смена роли (RBAC):
              </div>

              {(["ADMIN", "ANALYST", "VIEWER"] as UserRole[]).map((role) => {
                const user = PRESET_USERS[role];
                const isActive = currentUser.role === role;
                return (
                  <button
                    key={role}
                    className={`dropdown-item ${isActive ? "active" : ""}`}
                    onClick={() => handleRoleSelect(role)}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{user.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {role === "ADMIN"
                          ? "Полный доступ (редакт. лимитов)"
                          : role === "ANALYST"
                          ? "Анализ и ручной пересчет"
                          : "Только просмотр (Read-only)"}
                      </div>
                    </div>
                    {isActive && <Check size={14} color="#10B981" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
