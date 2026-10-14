import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { StatsCards } from "./components/StatsCards";
import { Toolbar } from "./components/Toolbar";
import { PricingTable } from "./components/PricingTable";
import { ProductCardGrid } from "./components/ProductCardGrid";
import { ProductDetailDrawer } from "./components/ProductDetailDrawer";
import { AddProductModal } from "./components/AddProductModal";
import { AuditLogModal } from "./components/AuditLogModal";
import { JsonModal } from "./components/JsonModal";

import type { Product, PriceResult } from "../types";
import type { ProductRow, AuditLogEntry, SortConfig } from "./types";
import { calculatePrice } from "../pricing";
import initialProductsData from "../../data/products.json";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const STORAGE_KEY_PRODUCTS = "salescout_products_v2";
const STORAGE_KEY_LOGS = "salescout_audit_logs";
const STORAGE_KEY_VIEW = "salescout_view_mode";

function MainDashboard() {
  const { currentUser, canReprice } = useAuth();

  // Load products from localStorage or fallback to initialProductsData
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load products from localStorage", e);
    }
    return initialProductsData as Product[];
  });

  const [results, setResults] = useState<PriceResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // View Mode: Table vs Grid Cards
  const [viewMode, setViewMode] = useState<"table" | "grid">(() => {
    return (localStorage.getItem(STORAGE_KEY_VIEW) as "table" | "grid") || "table";
  });

  // Theme
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("salescout_theme") as "dark" | "light") || "dark";
  });

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedReason, setSelectedReason] = useState<string>("ALL");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "asc",
  });

  // Modals & Drawers
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  // Audit Logs persisted in localStorage
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to load audit logs", e);
    }
    return [];
  });

  // Auto-pilot Kaspi Bot
  const [isBotActive, setIsBotActive] = useState<boolean>(false);
  const [botCountdown, setBotCountdown] = useState<number>(15);

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("salescout_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleToggleViewMode = (mode: "table" | "grid") => {
    setViewMode(mode);
    localStorage.setItem(STORAGE_KEY_VIEW, mode);
  };

  // Save products to localStorage on change
  const saveProductsToStorage = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updatedProducts));
    } catch (e) {
      console.warn("Failed to save products to localStorage", e);
    }
  };

  // Save audit logs to localStorage
  const saveAuditLogsToStorage = (updater: (prev: AuditLogEntry[]) => AuditLogEntry[]) => {
    setAuditLogs((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(next.slice(0, 100)));
      } catch (e) {
        console.warn("Failed to save audit logs", e);
      }
      return next;
    });
  };

  // Perform POST /reprice (with transparent calculatePrice fallback if API unreachable)
  const executeReprice = useCallback(
    async (
      itemsToReprice: Product[],
      initiator: string = `${currentUser.name} (${currentUser.role})`
    ) => {
      setIsLoading(true);
      setApiError(null);

      try {
        let data: PriceResult[];
        let usedFallback = false;

        try {
          const response = await fetch("/reprice", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(itemsToReprice),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${response.status}`);
          }
          data = await response.json();
        } catch (fetchErr) {
          // Сервер недоступен — считаем локально, но явно сообщаем об этом пользователю
          const reason = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
          usedFallback = true;
          setApiError(
            `POST /reprice недоступен (${reason}). Показан локальный расчёт — запустите сервер: npm run dev`
          );
          data = itemsToReprice.map((p) => calculatePrice(p));
        }

        setResults(data);

        // Record audit logs
        const now = new Date().toLocaleTimeString("ru-KZ", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const newLogEntries: AuditLogEntry[] = [];
        data.forEach((res) => {
          const prod = itemsToReprice.find((p) => p.sku === res.sku);
          if (prod) {
            newLogEntries.push({
              id: `${res.sku}-${Date.now()}-${Math.random()}`,
              timestamp: now,
              sku: res.sku,
              productName: prod.name,
              oldPrice: res.oldPrice,
              newPrice: res.newPrice,
              reason: res.reason,
              triggeredBy: initiator,
              role: currentUser.role,
            });
          }
        });

        saveAuditLogsToStorage((prev) => [...newLogEntries, ...prev]);
        if (!usedFallback) {
          setSuccessMessage("Цены пересчитаны через POST /reprice");
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      } catch (err) {
        setApiError(err instanceof Error ? err.message : "Ошибка пересчёта цен");
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser]
  );

  // Initial calculation on mount
  useEffect(() => {
    executeReprice(products, "Система (Инициализация)");
  }, []);

  // Auto-pilot bot interval
  useEffect(() => {
    if (!isBotActive) return;

    const timer = setInterval(() => {
      setBotCountdown((prev) => {
        if (prev <= 1) {
          executeReprice(products, "🤖 Авто-пилот Kaspi Bot");
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBotActive, products, executeReprice]);

  // Combined Rows
  const combinedRows: ProductRow[] = useMemo(() => {
    const map = new Map<string, PriceResult>();
    results.forEach((r) => map.set(r.sku, r));

    return products.map((p) => ({
      ...p,
      result: map.get(p.sku),
    }));
  }, [products, results]);

  // Counts for filters
  const counts = useMemo(() => {
    const total = combinedRows.length;
    let undercut = 0;
    let atMin = 0;
    let atMax = 0;
    let noCompetitors = 0;

    combinedRows.forEach((r) => {
      const reason = r.result?.reason;
      if (reason === "UNDERCUT") undercut++;
      else if (reason === "AT_MIN") atMin++;
      else if (reason === "AT_MAX") atMax++;
      else if (reason === "NO_COMPETITORS") noCompetitors++;
    });

    return { total, undercut, atMin, atMax, noCompetitors };
  }, [combinedRows]);

  // Sorting
  const handleSort = (key: SortConfig["key"]) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Filtered and Sorted Rows
  const processedRows = useMemo(() => {
    let list = combinedRows.filter((row) => {
      const matchesSearch =
        row.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesReason =
        selectedReason === "ALL" || row.result?.reason === selectedReason;

      return matchesSearch && matchesReason;
    });

    list.sort((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";

      if (sortConfig.key === "sku") {
        valA = a.sku;
        valB = b.sku;
      } else if (sortConfig.key === "name") {
        valA = a.name;
        valB = b.name;
      } else if (sortConfig.key === "oldPrice") {
        valA = a.result ? a.result.oldPrice : a.myPrice;
        valB = b.result ? b.result.oldPrice : b.myPrice;
      } else if (sortConfig.key === "newPrice") {
        valA = a.result ? a.result.newPrice : 0;
        valB = b.result ? b.result.newPrice : 0;
      } else if (sortConfig.key === "delta") {
        const deltaA = a.result ? a.result.newPrice - a.result.oldPrice : 0;
        const deltaB = b.result ? b.result.newPrice - b.result.oldPrice : 0;
        valA = deltaA;
        valB = deltaB;
      } else if (sortConfig.key === "reason") {
        valA = a.result?.reason || "";
        valB = b.result?.reason || "";
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [combinedRows, searchQuery, selectedReason, sortConfig]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      "SKU",
      "Название",
      "Старая цена (₸)",
      "Новая цена (₸)",
      "Разница (₸)",
      "Причина",
      "Мин. цена (₸)",
      "Макс. цена (₸)",
      "Шаг (₸)",
      "Конкурентов в наличии",
    ];

    const rowsData = combinedRows.map((r) => {
      const oldP = r.result ? r.result.oldPrice : r.myPrice;
      const newP = r.result ? r.result.newPrice : "";
      const delta = r.result ? r.result.newPrice - r.result.oldPrice : "";
      const inStock = r.competitors.filter((c) => c.inStock).length;

      return [
        `"${r.sku}"`,
        `"${r.name.replace(/"/g, '""')}"`,
        oldP,
        newP,
        delta,
        r.result?.reason || "",
        r.minPrice,
        r.maxPrice,
        r.step,
        inStock,
      ].join(",");
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rowsData].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `salescout_reprice_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Actions with LocalStorage persistence
  const handleSaveProduct = (updated: Product) => {
    const nextList = products.map((p) => (p.sku === updated.sku ? updated : p));
    saveProductsToStorage(nextList);
    executeReprice(nextList, `${currentUser.name} (Редактирование товара)`);
  };

  const handleAddProduct = (newProd: Product) => {
    const nextList = [newProd, ...products];
    saveProductsToStorage(nextList);
    executeReprice(nextList, `${currentUser.name} (Добавлен новый товар)`);
  };

  const handleDeleteProduct = (sku: string) => {
    if (confirm(`Удалить товар ${sku} из мониторинга?`)) {
      const nextList = products.filter((p) => p.sku !== sku);
      saveProductsToStorage(nextList);
      executeReprice(nextList, `${currentUser.name} (Удаление товара)`);
    }
  };

  const handleResetToDemo = () => {
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    const defaultData = initialProductsData as Product[];
    saveProductsToStorage(defaultData);
    executeReprice(defaultData, "Сброс к эталонным 6 товарам");
  };

  const handleApplyJson = (newProducts: Product[]) => {
    saveProductsToStorage(newProducts);
    executeReprice(newProducts, `${currentUser.name} (Импорт JSON)`);
  };

  return (
    <div className="app-container">
      {/* Header with Master Logo, View Mode Toggle, Auto-pilot & RBAC */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        isBotActive={isBotActive}
        onToggleBot={() => setIsBotActive(!isBotActive)}
        botCountdown={botCountdown}
        onOpenAuditLog={() => setIsAuditModalOpen(true)}
        auditCount={auditLogs.length}
      />

      {/* Notifications */}
      {apiError && (
        <div className="alert-banner alert-error">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={18} />
            <span>{apiError}</span>
          </div>
          <button
            className="btn btn-secondary"
            style={{ padding: "4px 8px", fontSize: "12px" }}
            onClick={() => executeReprice(products)}
          >
            Повторить попытку
          </button>
        </div>
      )}

      {successMessage && (
        <div className="alert-banner alert-success">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* KPI Stats Bar with Segmented Catalog Distribution */}
      <StatsCards rows={combinedRows} />

      {/* Toolbar with Search, Filter Chips, Add Product, JSON, CSV */}
      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedReason={selectedReason}
        onSelectReason={setSelectedReason}
        counts={counts}
        isLoading={isLoading}
        onReprice={() => executeReprice(products)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        onResetToDemo={handleResetToDemo}
        onExportCsv={handleExportCsv}
        viewMode={viewMode}
        onChangeViewMode={handleToggleViewMode}
      />

      {/* Main Content: 5-Column Table OR Grid Cards View */}
      {viewMode === "table" ? (
        <PricingTable
          rows={processedRows}
          sortConfig={sortConfig}
          onSort={handleSort}
          onInspect={(p) => setInspectingProduct(p)}
          onDeleteProduct={handleDeleteProduct}
        />
      ) : (
        <ProductCardGrid
          rows={processedRows}
          onInspect={(p) => setInspectingProduct(p)}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {/* Product Detail / What-If Simulator Drawer */}
      <ProductDetailDrawer
        product={inspectingProduct}
        onClose={() => setInspectingProduct(null)}
        onSave={handleSaveProduct}
      />

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddProduct}
      />

      {/* Raw JSON Modal */}
      <JsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        products={products}
        onApply={handleApplyJson}
      />

      {/* Audit Log Modal */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        logs={auditLogs}
        onClearLogs={() => {
          setAuditLogs([]);
          localStorage.removeItem(STORAGE_KEY_LOGS);
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainDashboard />
    </AuthProvider>
  );
}
