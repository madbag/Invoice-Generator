import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignIn from "../../components/Auth/LoginForm";

// mock react-router navigate
const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

// mock AuthContext
const mockAuthSignIn = vi.fn();
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ signIn: mockAuthSignIn }),
}));

// mock signIn API call
vi.mock("../../api/index.ts", () => ({
  signIn: vi.fn(),
}));

import { signIn } from "../../api/index.ts";

describe("SignIn Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── RENDERING ─────────────────────────────────────────────────────────────

  it("should render email and password inputs", () => {
    render(<SignIn />);
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
  });

  it("should render sign in button", () => {
    render(<SignIn />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  // ─── VALIDATION ────────────────────────────────────────────────────────────

  it("should show error when fields are empty on submit", async () => {
    render(<SignIn />);
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByText("All fields are required")).toBeInTheDocument();
  });

  it("should not show error when fields are filled", async () => {
    (signIn as any).mockResolvedValue({ data: { token: "abc123" } });
    render(<SignIn />);

    await userEvent.type(screen.getByPlaceholderText("Enter your email"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("Enter your password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.queryByText("All fields are required")).not.toBeInTheDocument();
    });
  });

  // ─── SUCCESSFUL LOGIN ──────────────────────────────────────────────────────

  it("should call signIn with form data on submit", async () => {
    (signIn as any).mockResolvedValue({ data: { token: "abc123" } });
    render(<SignIn />);

    await userEvent.type(screen.getByPlaceholderText("Enter your email"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("Enter your password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("should call authSignIn and navigate to dashboard on success", async () => {
    const mockData = { token: "abc123" };
    (signIn as any).mockResolvedValue({ data: mockData });
    render(<SignIn />);

    await userEvent.type(screen.getByPlaceholderText("Enter your email"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("Enter your password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockAuthSignIn).toHaveBeenCalledWith(mockData);
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  // ─── ERROR HANDLING ────────────────────────────────────────────────────────

  it("should show error when user does not exist (404)", async () => {
    (signIn as any).mockRejectedValue({ response: { status: 404 } });
    render(<SignIn />);

    await userEvent.type(screen.getByPlaceholderText("Enter your email"), "nobody@example.com");
    await userEvent.type(screen.getByPlaceholderText("Enter your password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("This user does not exist")).toBeInTheDocument();
    });
  });

  it("should show server error message from response", async () => {
    (signIn as any).mockRejectedValue({
      response: { status: 400, data: { message: "Invalid credentials" } },
    });
    render(<SignIn />);

    await userEvent.type(screen.getByPlaceholderText("Enter your email"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("Enter your password"), "wrongpassword");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("should show generic error when no response data", async () => {
    (signIn as any).mockRejectedValue(new Error("Network Error"));
    render(<SignIn />);

    await userEvent.type(screen.getByPlaceholderText("Enter your email"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("Enter your password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("An error occurred during sign in")).toBeInTheDocument();
    });
  });
});