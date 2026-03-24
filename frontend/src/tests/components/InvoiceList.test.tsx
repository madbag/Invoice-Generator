import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InvoiceList from "../../components/Invoices/InvoiceList";

// mock axios
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

// mock AuthContext
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ token: "test-token" }),
}));

// mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

import axios from "axios";

const mockInvoices = [
  {
    _id: "1",
    invoiceNo: "INV-001",
    clientName: "Acme Corp",
    invoiceDate: "2024-01-01",
    status: "pending",
  },
  {
    _id: "2",
    invoiceNo: "INV-002",
    clientName: "Beta Ltd",
    invoiceDate: "2024-02-01",
    status: "paid",
  },
];

describe("InvoiceList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  // ─── LOADING / EMPTY STATE ─────────────────────────────────────────────────

  it("should show loading initially", () => {
    (axios.get as any).mockResolvedValue({ data: [] });
    render(<InvoiceList />);
    expect(screen.getByText("Loading invoices...")).toBeInTheDocument();
  });

  it("should show empty state when no invoices", async () => {
    (axios.get as any).mockResolvedValue({ data: [] });
    render(<InvoiceList />);

    await waitFor(() => {
      expect(screen.getByText("You do not have any invoices right now.")).toBeInTheDocument();
    });
  });

  // ─── RENDERS LIST ──────────────────────────────────────────────────────────

  it("should render invoices", async () => {
    (axios.get as any).mockResolvedValue({ data: mockInvoices });
    render(<InvoiceList />);

    await waitFor(() => {
      expect(screen.getByText("INV-001")).toBeInTheDocument();
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
      expect(screen.getByText("INV-002")).toBeInTheDocument();
      expect(screen.getByText("Beta Ltd")).toBeInTheDocument();
    });
  });

  it("should respect the limit prop", async () => {
    (axios.get as any).mockResolvedValue({ data: mockInvoices });
    render(<InvoiceList limit={1} />);

    await waitFor(() => {
      expect(screen.getByText("INV-001")).toBeInTheDocument();
      expect(screen.queryByText("INV-002")).not.toBeInTheDocument();
    });
  });

  // ─── ACTIONS ───────────────────────────────────────────────────────────────

  it("should navigate to invoice preview on view click", async () => {
    (axios.get as any).mockResolvedValue({ data: mockInvoices });
    render(<InvoiceList />);

    await waitFor(() => screen.getAllByText("View"));
    await userEvent.click(screen.getAllByText("View")[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/invoice-preview/1");
  });

  it("should delete invoice on confirm", async () => {
    (axios.get as any).mockResolvedValue({ data: mockInvoices });
    (axios.delete as any).mockResolvedValue({});
    render(<InvoiceList />);

    await waitFor(() => screen.getAllByText("Delete"));
    await userEvent.click(screen.getAllByText("Delete")[0]);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        "http://localhost:5000/api/invoices/1",
        expect.any(Object)
      );
      expect(screen.queryByText("INV-001")).not.toBeInTheDocument();
    });
  });

  it("should not delete invoice when confirm is cancelled", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    (axios.get as any).mockResolvedValue({ data: mockInvoices });
    render(<InvoiceList />);

    await waitFor(() => screen.getAllByText("Delete"));
    await userEvent.click(screen.getAllByText("Delete")[0]);

    expect(axios.delete).not.toHaveBeenCalled();
  });
});