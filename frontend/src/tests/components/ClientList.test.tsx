import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClientList from "../../components/Clients/ClientList";

// mock axios
vi.mock("axios", () => ({
  default: {
    delete: vi.fn(),
  },
}));

// mock AuthContext
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ token: "test-token" }),
}));

// mock ClientContext
const mockFetchClients = vi.fn();
const mockUseClients = vi.fn(() => ({
  clients: mockClients,
  fetchClients: mockFetchClients,
}));

vi.mock("../../context/ClientContext", () => ({
  useClients: () => mockUseClients(),
}));

import axios from "axios";

const mockClients = [
  {
    _id: "1",
    clientName: "Acme Corp",
    clientEmail: "acme@example.com",
    contactNumber: "1234567890",
    clientAddress: "123 Main St",
    invoiceCount: 3,
    totalBilled: 1500,
  },
  {
    _id: "2",
    clientName: "Beta Ltd",
    clientEmail: "beta@example.com",
    contactNumber: "0987654321",
    clientAddress: "456 Side St",
    invoiceCount: 1,
    totalBilled: 500,
  },
];

describe("ClientList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  // ─── EMPTY STATE ───────────────────────────────────────────────────────────

it("should show empty state when no clients", () => {
  mockUseClients.mockReturnValueOnce({ clients: [], fetchClients: mockFetchClients });
  render(<ClientList />);
  expect(screen.getByText(/You do not have any clients right now/i)).toBeInTheDocument();
});

  // ─── RENDERS LIST ──────────────────────────────────────────────────────────

  it("should render client list", () => {
    render(<ClientList />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("acme@example.com")).toBeInTheDocument();
    expect(screen.getByText("Beta Ltd")).toBeInTheDocument();
  });

  it("should render invoice count and total billed", () => {
    render(<ClientList />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("€ 1500")).toBeInTheDocument();
  });

  // ─── DELETE ────────────────────────────────────────────────────────────────

  it("should call delete and fetchClients on confirm", async () => {
    (axios.delete as any).mockResolvedValue({});
    render(<ClientList />);

    await userEvent.click(screen.getAllByText("Delete")[0]);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        "http://localhost:5000/api/clients/1",
        expect.any(Object)
      );
      expect(mockFetchClients).toHaveBeenCalled();
    });
  });

  it("should not delete when confirm is cancelled", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<ClientList />);

    await userEvent.click(screen.getAllByText("Delete")[0]);

    expect(axios.delete).not.toHaveBeenCalled();
    expect(mockFetchClients).not.toHaveBeenCalled();
  });
});