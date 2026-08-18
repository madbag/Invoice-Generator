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
  updateUser: (data: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = (data: any) => {
    const authData = {
      user: data.result,
      token: data.token,
    };
    setToken(authData.token);
    setUser(authData.user);
    localStorage.setItem("auth", JSON.stringify(authData));
  };

  const register = (data: any) => {
    const authData = { user: data.result, token: data.token };
    setUser(authData.user);
    setToken(authData.token);
    localStorage.setItem("auth", JSON.stringify(authData));
  };

  const signOut = () => {
    localStorage.removeItem("auth");
    setUser(null);
    setToken(null);
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => {
      const updated = prev ? { ...prev, ...data } : (data as User);
      const stored = localStorage.getItem("auth");
      const authData = stored ? JSON.parse(stored) : {};
      localStorage.setItem(
        "auth",
        JSON.stringify({ ...authData, user: updated }),
      );
      return updated;
    });
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
    <AuthContext.Provider
      value={{ user, token, signIn, signOut, register, updateUser }}
    >
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
