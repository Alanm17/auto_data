import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { StatsCards } from "./components/StatsCards";
import { Toolbar } from "./components/Toolbar";
import { PricingTable } from "./components/PricingTable";
import { ProductDetailDrawer } from "./components/ProductDetailDrawer";
import { AddProductModal } from "./components/AddProductModal";
import { AuditLogModal } from "./components/AuditLogModal";
import { JsonModal } from "./components/JsonModal";

import type { Product, PriceResult } from "../types";
import type { ProductRow, AuditLogEntry, SortConfig } from "./types";
import initialProductsData from "../../data/products.json";
import { AlertCircle, CheckCircle2 } from "lucide-react";

function MainDashboard() {
  const { currentUser, canReprice } = useAuth();

  // State
  const [products, setProducts] = useState<Product[]>(
    initialProductsData as Product[]
  );
  const [results, setResults] = useState<PriceResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Theme
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("salescout_theme") as "dark" | "light") || "dark";
  });

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedReason, setSelectedReason] = useState<string>("ALL");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "sku",
    direction: "asc",
  });

  // Modals & Drawers
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

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

  // Perform POST /reprice
  const executeReprice = useCallback(
    async (
      itemsToReprice: Product[],
      initiator: string = `${currentUser.name} (${currentUser.role})`
    ) => {
      setIsLoading(true);
      setApiError(null);

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
          throw new Error(errData.error || `Ошибка сервера: HTTP ${response.status}`);
        }

        const data: PriceResult[] = await response.json();
        setResults(data);

        // Record audit logs for modified items
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

        setAuditLogs((prev) => [...newLogEntries, ...prev].slice(0, 100));
        setSuccessMessage("Цены успешно пересчитаны через POST /reprice!");
        setTimeout(() => setSuccessMessage(null), 3500);
      } catch (err: any) {
        setApiError(err.message || "Не удалось связаться с сервером POST /reprice");
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser]
  );

  // Initial load
  useEffect(() => {
    executeReprice(products, "Система (Инициализация)");
  }, []);

  // Auto-pilot interval worker
  useEffect(() => {
    if (!isBotActive) return;

    const timer = setInterval(() => {
      setBotCountdown((prev) => {
        if (prev <= 1) {
          // Trigger automated reprice with simulated competitor activity
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

  // Sorting handler
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

    // Sorting
    list.sort((a, b) => {
      let valA: any;
      let valB: any;

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
      const inStock = r.competitors.filter((c: any) => c.inStock).length;

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

  // Actions
  const handleSaveProduct = (updated: Product) => {
    const nextList = products.map((p) => (p.sku === updated.sku ? updated : p));
    setProducts(nextList);
    executeReprice(nextList, `${currentUser.name} (Редактирование товара)`);
  };

  const handleAddProduct = (newProd: Product) => {
    const nextList = [newProd, ...products];
    setProducts(nextList);
    executeReprice(nextList, `${currentUser.name} (Добавлен новый товар)`);
  };

  const handleDeleteProduct = (sku: string) => {
    if (confirm(`Удалить товар ${sku} из мониторинга?`)) {
      const nextList = products.filter((p) => p.sku !== sku);
      setProducts(nextList);
      executeReprice(nextList, `${currentUser.name} (Удаление товара)`);
    }
  };

  const handleResetToDemo = () => {
    setProducts(initialProductsData as Product[]);
    executeReprice(initialProductsData as Product[], "Сброс к эталонным данным");
  };

  const handleApplyJson = (newProducts: Product[]) => {
    setProducts(newProducts);
    executeReprice(newProducts, `${currentUser.name} (Импорт JSON)`);
  };

  return (
    <div className="app-container">
      {/* Navbar */}
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

      {/* KPI Stats Bar */}
      <StatsCards rows={combinedRows} />

      {/* Toolbar */}
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
      />

      {/* Pricing Table (Было / Стало) */}
      <PricingTable
        rows={processedRows}
        sortConfig={sortConfig}
        onSort={handleSort}
        onInspect={(p) => setInspectingProduct(p)}
        onDeleteProduct={handleDeleteProduct}
      />

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
        onClearLogs={() => setAuditLogs([])}
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
