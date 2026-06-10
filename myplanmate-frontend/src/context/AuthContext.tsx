// ============================================================
//  MyPlanMate – Auth Context
//  Provides user state to the whole app.
// ============================================================
import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../api/client";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Restore session from localStorage on app load
  useEffect(() => {
    const stored = localStorage.getItem("mpm_user");
    const token = localStorage.getItem("mpm_token");
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = (u: User) => {
    localStorage.setItem("mpm_token", u.token);
    localStorage.setItem("mpm_user", JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("mpm_token");
    localStorage.removeItem("mpm_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
