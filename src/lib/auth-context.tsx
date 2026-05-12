"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "guest";
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("gt_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = (u: User) => {
    setUser(u);
    sessionStorage.setItem("gt_user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("gt_user");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAdmin: user?.role === "admin" }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
