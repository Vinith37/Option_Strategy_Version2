import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { API_BASE_URL } from "../utils/api";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 Restore session using JWT
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data) {
          setUser(data);
        } else {
          localStorage.removeItem("token");
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  // --------------------
  // Register
  // --------------------
  const signup = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      return res.ok;
    } catch {
      return false;
    }
  };

  // --------------------
  // Login (FIXED)
  // --------------------
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) return false;

      const data = await res.json();

      // ✅ Save token
      localStorage.setItem("token", data.access_token);

      // ✅ Save user
      setUser(data.user);

      return true;
    } catch {
      return false;
    }
  };

  // --------------------
  // Logout
  // --------------------
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
