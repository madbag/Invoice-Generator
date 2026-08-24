import { createContext, useState } from "react";
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
  const [invoiceNo, setInvoiceNo] = useState("");

  const [form, setForm] = useState<InvoiceForm>({
    clientName: "",
    clientAddress: "",
    clientEmail: "",
    contactNumber: "",
    invoiceDate: "",
  });
  const [items, setItems] = useState<InvoiceItem[]>([]);

  const [total, setTotal] = useState(0);

  const setInvoiceData = (data: Partial<InvoiceContextType>) => {
    if (data.invoiceNo !== undefined) setInvoiceNo(data.invoiceNo);
    if (data.form !== undefined) setForm(data.form);
    if (data.items !== undefined) setItems(data.items);
    if (data.total !== undefined) setTotal(data.total);
  };

  return (
    <InvoiceContext.Provider
      value={{ invoiceNo, form, items, total, setInvoiceData }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};
