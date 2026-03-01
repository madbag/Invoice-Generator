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
  signIn: (data: any) => void;
  signOut: () => void;
  register: (data: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profile = localStorage.getItem("profile");
    if (profile) {
      setUser(JSON.parse(profile));
    }
    setLoading(false);
  }, []);

  const signIn = (data: any) => {
    localStorage.setItem("profile", JSON.stringify(data.result));
    setUser(data.result);
  };

  const register = (data: any) => {
    localStorage.setItem("profile", JSON.stringify(data.result));
    setUser(data.result);
  };

  const signOut = () => {
    localStorage.removeItem("profile");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, register }}>
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
