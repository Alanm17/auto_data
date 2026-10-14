import React from "react";

// Логотип Apple
export function AppleLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.6-1.07.97-2.35.79-3.42-.99.04-2.18.66-2.88 1.48-.61.71-1.14 1.87-.96 2.93 1.11.09 2.25-.56 3.05-.99z" />
    </svg>
  );
}

// Логотип Samsung (Authentic Brand Orbit & Monogram)
export function SamsungLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Iconic Samsung tilted ellipse orbit */}
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="6.4"
        transform="rotate(-16 12 12)"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Sharp stylized geometric Samsung S */}
      <path
        d="M14.6 9.1c-.4-.9-1.3-1.5-2.6-1.5-1.5 0-2.5.8-2.5 2 0 1.2 1 1.7 2.3 2.1 1.6.4 2.8.9 2.8 2.5 0 1.6-1.4 2.6-3 2.6-1.7 0-2.8-.9-3.2-2.2l1.6-.6c.2.8.8 1.3 1.6 1.3.9 0 1.5-.5 1.5-1.2 0-.9-.8-1.3-2.3-1.8-1.6-.4-2.8-1-2.8-2.5 0-1.6 1.3-2.6 2.8-2.6 1.4 0 2.4.7 2.8 1.8l-1.5.7z"
        fill="currentColor"
      />
    </svg>
  );
}

// Логотип Xiaomi (Authentic Kenya Hara Squircle & Mi Monogram)
export function XiaomiLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Xiaomi squircle contour */}
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.8" />
      {/* Signature Xiaomi Mi monogram */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 7.5h8.2c1.2 0 2.1.9 2.1 2.1v6.9h-1.9v-6.2c0-.4-.3-.7-.7-.7h-1.2v6.9h-1.9v-5.4h-1v5.4H6V7.5zm11.2 0H19v9h-1.8V7.5z"
        fill="currentColor"
      />
    </svg>
  );
}

// Логотип Dyson (Aerodynamic Ring & Geometric "d" Monogram)
export function DysonLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Dyson aerodynamic guide */}
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.75" opacity="0.4" />
      {/* Iconic Dyson geometric lower-case "d" mark */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.5 5h2v11.5c0 1.1-.9 2-2 2-.4 0-.7-.1-.9-.2l.2-1.6c.2 0 .3.1.5.1.4 0 .6-.2.6-.5v-1.6c-.7.9-1.8 1.4-2.9 1.4-2.3 0-4-1.8-4-4.1s1.7-4.1 4-4.1c1.1 0 2.2.5 2.9 1.4V5zm-.2 7.2c0-1.3-1-2.4-2.3-2.4s-2.3 1.1-2.3 2.4 1 2.4 2.3 2.4 2.3-1.1 2.3-2.4z"
        fill="currentColor"
      />
    </svg>
  );
}

// Логотип JBL (Acoustic Speaker Frame & Bold Geometric Lettermark)
export function JblLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* JBL acoustic speaker enclosure */}
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.75" opacity="0.4" />
      {/* Bold JBL geometric lettermark */}
      <path
        d="M5.5 8.5h1.9v4.2c0 .8-.5 1.3-1.3 1.3h-.6V12.6h.2c.2 0 .3-.1.3-.3V8.5zm2.8 0h3c.9 0 1.5.5 1.5 1.3 0 .5-.3.9-.8 1.1.6.2.9.7.9 1.3 0 .9-.7 1.5-1.7 1.5H8.3V8.5zm1.6 1.9h1.1c.2 0 .3-.1.3-.3s-.1-.3-.3-.3H9.9v.6zm0 1.9h1.2c.2 0 .4-.1.4-.4s-.2-.4-.4-.4H9.9v.8zm4.6-3.8h1.6v4.1H18.5V13.7H14.5V8.5z"
        fill="currentColor"
      />
    </svg>
  );
}

// Логотип SaleScout Pro (Master Brand)
export function SaleScoutLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={className}>
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
