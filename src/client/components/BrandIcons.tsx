import React from "react";

// Логотип Apple
export function AppleLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.6-1.07.97-2.35.79-3.42-.99.04-2.18.66-2.88 1.48-.61.71-1.14 1.87-.96 2.93 1.11.09 2.25-.56 3.05-.99z" />
    </svg>
  );
}

// Логотип Samsung (Authentic Brand Badge)
export function SamsungLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      <rect width="28" height="28" rx="7" fill="#0C238A" />
      <text
        x="50%"
        y="56%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="white"
        fontFamily="sans-serif"
        fontWeight="800"
        fontSize="8.5"
        letterSpacing="0.05em"
      >
        SAMSUNG
      </text>
    </svg>
  );
}

// Логотип Xiaomi (Authentic Mi Badge)
export function XiaomiLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      <rect width="28" height="28" rx="8" fill="#FF6900" />
      <path
        d="M8.5 9h3v6.5h2.5V9h3v10h-3v-4.5h-2.5V19h-3V9z"
        fill="white"
      />
    </svg>
  );
}

// Логотип Dyson (Premium Fuchsia Dyson Badge)
export function DysonLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      <rect width="28" height="28" rx="7" fill="#E11D48" />
      <text
        x="50%"
        y="56%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="white"
        fontFamily="sans-serif"
        fontWeight="800"
        fontSize="10"
        letterSpacing="-0.02em"
      >
        dyson
      </text>
    </svg>
  );
}

// Логотип JBL (Authentic JBL Orange Badge)
export function JblLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      <rect width="28" height="28" rx="7" fill="#EA580C" />
      <text
        x="50%"
        y="56%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="white"
        fontFamily="sans-serif"
        fontWeight="900"
        fontSize="11"
        letterSpacing="0.02em"
      >
        JBL
      </text>
    </svg>
  );
}

// Логотип SaleScout Pro (Master Brand)
export function SaleScoutLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="scoutGradient" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF4B3A" />
          <stop offset="0.5" stopColor="#F14635" />
          <stop offset="1" stopColor="#C92113" />
        </linearGradient>
        <linearGradient id="ringGradient" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFD1CC" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {/* Background Rounded Squircle */}
      <rect width="36" height="36" rx="10" fill="url(#scoutGradient)" />
      {/* Target Radar Rings */}
      <circle cx="18" cy="18" r="11" stroke="url(#ringGradient)" strokeWidth="1.5" strokeDasharray="3 2" />
      {/* Repricing Dynamic Arrow (Wins the Buy Box) */}
      <path
        d="M19.5 10.5L12 19.5H17.5L16.5 25.5L24 16.5H18.5L19.5 10.5Z"
        fill="white"
        stroke="#FFFFFF"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Определение бренда по SKU или названию
export function getProductBrandInfo(sku: string, name: string) {
  const upper = (sku + " " + name).toUpperCase();
  if (upper.includes("IPH") || upper.includes("APPLE") || upper.includes("AIRPODS")) {
    return {
      brand: "Apple",
      badgeColor: "#F1F5F9",
      badgeBg: "rgba(255, 255, 255, 0.12)",
      logo: AppleLogo,
      category: "Смартфоны & Аудио",
    };
  }
  if (upper.includes("SAM") || upper.includes("SAMSUNG") || upper.includes("GALAXY")) {
    return {
      brand: "Samsung",
      badgeColor: "#60A5FA",
      badgeBg: "rgba(37, 99, 235, 0.18)",
      logo: SamsungLogo,
      category: "Смартфоны",
    };
  }
  if (upper.includes("XIA") || upper.includes("XIAOMI") || upper.includes("REDMI")) {
    return {
      brand: "Xiaomi",
      badgeColor: "#FB923C",
      badgeBg: "rgba(255, 105, 0, 0.18)",
      logo: XiaomiLogo,
      category: "Смартфоны",
    };
  }
  if (upper.includes("DYSON") || upper.includes("DETECT")) {
    return {
      brand: "Dyson",
      badgeColor: "#F472B6",
      badgeBg: "rgba(225, 29, 72, 0.18)",
      logo: DysonLogo,
      category: "Техника для дома",
    };
  }
  if (upper.includes("JBL") || upper.includes("FLIP")) {
    return {
      brand: "JBL",
      badgeColor: "#FB923C",
      badgeBg: "rgba(234, 88, 12, 0.18)",
      logo: JblLogo,
      category: "Акустика",
    };
  }
  return {
    brand: "Товар",
    badgeColor: "#38BDF8",
    badgeBg: "rgba(56, 189, 248, 0.15)",
    logo: SaleScoutLogo,
    category: "Электроника",
  };
}
