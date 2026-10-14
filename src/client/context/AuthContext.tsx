import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, UserRole } from "../types";

export const PRESET_USERS: Record<UserRole, User> = {
  ADMIN: {
    id: "usr-admin-1",
    name: "Алишер Касымов",
    email: "alisher.admin@salescout.kz",
    role: "ADMIN",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
  },
  ANALYST: {
    id: "usr-analyst-2",
    name: "Динара Сатпаева",
    email: "dinara.analyst@salescout.kz",
    role: "ANALYST",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80",
  },
  VIEWER: {
    id: "usr-viewer-3",
    name: "Ерлан Нургалиев",
    email: "erlan.audit@salescout.kz",
    role: "VIEWER",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
  },
};

interface AuthContextType {
  currentUser: User;
  switchRole: (role: UserRole) => void;
  canEditLimits: boolean;
  canReprice: boolean;
  canManageProducts: boolean;
  canToggleBot: boolean;
  canExport: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem("salescout_role");
    if (saved && (saved === "ADMIN" || saved === "ANALYST" || saved === "VIEWER")) {
      return PRESET_USERS[saved as UserRole];
    }
    return PRESET_USERS.ADMIN;
  });

  const switchRole = (role: UserRole) => {
    const user = PRESET_USERS[role];
    setCurrentUser(user);
    localStorage.setItem("salescout_role", role);
  };

  const canEditLimits = currentUser.role === "ADMIN";
  const canReprice = currentUser.role === "ADMIN" || currentUser.role === "ANALYST";
  const canManageProducts = currentUser.role === "ADMIN";
  const canToggleBot = currentUser.role === "ADMIN";
  const canExport = true; // All roles can export reports

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchRole,
        canEditLimits,
        canReprice,
        canManageProducts,
        canToggleBot,
        canExport,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
