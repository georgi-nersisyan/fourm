'use client'

import { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface User {
  id: number;
  username: string;
  avatar: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const isLoggedIn = !!user;  

  useEffect(() => {
    fetch("http://localhost:5000/me", {
      credentials: "include",
    })
      .then(res => res.ok ? res.json() : null)
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}