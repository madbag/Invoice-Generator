import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface InvoiceItem {
  description: string;
  quantity: number;
  cost: number;
}

interface InvoiceForm {
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  contactNumber: string;
  invoiceDate: string;
}

interface InvoiceContextType {
  invoiceNo: string;
  form: InvoiceForm;
  items: InvoiceItem[];
  total: number;
  setInvoiceData: (data: Partial<InvoiceContextType>) => void;
}

export const InvoiceContext = createContext<InvoiceContextType | null>(null);

export const InvoiceProvider = ({ children }: { children: ReactNode }) => {
  const savedInvoice = localStorage.getItem("invoice");
  const parsedInvoice = savedInvoice ? JSON.parse(savedInvoice) : null;

  const [invoiceNo, setInvoiceNo] = useState(parsedInvoice?.invoiceNo || "");

  const [form, setForm] = useState<InvoiceForm>(
    parsedInvoice?.form || {
      clientName: "",
      clientAddress: "",
      clientEmail: "",
      contactNumber: "",
      invoiceDate: "",
    },
  );
  const [items, setItems] = useState<InvoiceItem[]>(parsedInvoice?.items || []);

  const [total, setTotal] = useState(parsedInvoice?.total || 0);

  const setInvoiceData = (data: Partial<InvoiceContextType>) => {
    if (data.invoiceNo !== undefined) setInvoiceNo(data.invoiceNo);
    if (data.form !== undefined) setForm(data.form);
    if (data.items !== undefined) setItems(data.items);
    if (data.total !== undefined) setTotal(data.total);
  };

  useEffect(() => {
    const invoiceData = { invoiceNo, form, items, total };
    localStorage.setItem("invoice", JSON.stringify(invoiceData));
  }, [invoiceNo, form, items, total]);
  return (
    <InvoiceContext.Provider
      value={{ invoiceNo, form, items, total, setInvoiceData }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};
