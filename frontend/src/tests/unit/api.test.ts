import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

// mock axios
vi.mock("axios", () => {
  const mockAxiosInstance = {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

// import AFTER mock
import { signIn, signUp, getProfile, updateProfile, deleteProfile } from "../../api/index";

const getMockAPI = () => (axios.create as any)();

describe("API functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // ─── AUTH ──────────────────────────────────────────────────────────────────

  describe("signIn", () => {
    it("should call POST /auth/login with form data", async () => {
      const mockAPI = getMockAPI();
      mockAPI.post.mockResolvedValue({ data: { token: "abc123" } });

      await signIn({ email: "test@example.com", password: "password123" });

      expect(mockAPI.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  describe("signUp", () => {
    it("should call POST /auth/register with form data", async () => {
      const mockAPI = getMockAPI();
      mockAPI.post.mockResolvedValue({ data: { token: "abc123" } });

      await signUp({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "password123",
      });

      expect(mockAPI.post).toHaveBeenCalledWith("/auth/register", {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  // ─── PROFILE ───────────────────────────────────────────────────────────────

  describe("getProfile", () => {
    it("should call GET /auth/profile", async () => {
      const mockAPI = getMockAPI();
      mockAPI.get.mockResolvedValue({ data: { email: "test@example.com" } });

      await getProfile();

      expect(mockAPI.get).toHaveBeenCalledWith("/auth/profile");
    });
  });

  describe("updateProfile", () => {
    it("should call PUT /auth/profile with data", async () => {
      const mockAPI = getMockAPI();
      mockAPI.put.mockResolvedValue({ data: { email: "new@example.com" } });

      await updateProfile({ firstName: "Updated" });

      expect(mockAPI.put).toHaveBeenCalledWith("/auth/profile", {
        firstName: "Updated",
      });
    });
  });

  describe("deleteProfile", () => {
    it("should call DELETE /auth/profile", async () => {
      const mockAPI = getMockAPI();
      mockAPI.delete.mockResolvedValue({ data: { message: "Deleted" } });

      await deleteProfile();

      expect(mockAPI.delete).toHaveBeenCalledWith("/auth/profile");
    });
  });
});