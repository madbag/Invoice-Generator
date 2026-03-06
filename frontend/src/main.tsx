import ReactDOM from "react-dom/client";
import { AuthProvider } from "./context/AuthContext.tsx";
import { InvoiceProvider } from "./context/InvoiceContext.tsx";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import React from "react";
import { ClientProvider } from "./context/ClientContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <InvoiceProvider>
          <ClientProvider>
            <App />
          </ClientProvider>
        </InvoiceProvider>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
