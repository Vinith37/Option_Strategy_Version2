import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const API_URL = "http://127.0.0.1:8000";

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

  // Restore session on refresh
  useEffect(() => {
    fetch(`${API_URL}/auth/me`, {
      credentials: "include",
    })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data) setUser(data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // --------------------
  // Register
  // --------------------
  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) return false;

      const user: User = await res.json();
      setUser(user);
      return true;
    } catch {
      return false;
    }
  };

  // --------------------
  // Login
  // --------------------
  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) return false;

      const user: User = await res.json();
      setUser(user);
      return true;
    } catch {
      return false;
    }
  };

  // --------------------
  // Logout
  // --------------------
  const logout = () => {
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

// --------------------
// Hook
// --------------------
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
