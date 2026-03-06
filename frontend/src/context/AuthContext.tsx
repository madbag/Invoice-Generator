import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface User {
  firstName?: string;
  lastName?: string;
  email: string;
  businessDetails?: {
    address?: string;
    contact?: string;
    logoUrl?: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  signIn: (data: any) => void;
  signOut: () => void;
  register: (data: any) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = (data: any) => {
    const authData = {
      user: data.result,
      token: data.token,
    };

    setToken(authData.token);
    setUser(authData.user);

    localStorage.setItem(
      "auth",
      JSON.stringify({ user: data.result, token: data.token }),
    );
  };

  const register = (data: any) => {
    localStorage.setItem("auth", JSON.stringify(data.result));
    setUser(data.result);
  };

  const signOut = () => {
    localStorage.removeItem("auth");
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed.user);
      setToken(parsed.token);
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut, register }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
