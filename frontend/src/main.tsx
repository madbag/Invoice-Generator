import ReactDOM from "react-dom/client";
import { AuthProvider } from "./context/AuthContext.tsx";
import { InvoiceProvider } from "./context/InvoiceContext.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import React from "react";
import { ClientProvider } from "./context/ClientContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <InvoiceProvider>
            <ClientProvider>
              <App />
            </ClientProvider>
          </InvoiceProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
