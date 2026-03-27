import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { useAuth } from "./AuthContext";
import { API } from "../api";

interface Client {
  _id: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  contactNumber: string;
  invoiceCount?: number;
  totalBilled?: number;
}

interface ClientContextType {
  clients: Client[];
  fetchClients: () => void;
}

const ClientContext = createContext<ClientContextType | null>(null);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);

  const fetchClients = async () => {
    if (!token) return;
    try {
      const res = await API.get("/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(res.data);
    } catch (err) {
      console.error("Failed to fetch clients", err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [token]);

  return (
    <ClientContext.Provider value={{ clients, fetchClients }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClients = () => {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error("useClients must be used within ClientProvider");
  return ctx;
};