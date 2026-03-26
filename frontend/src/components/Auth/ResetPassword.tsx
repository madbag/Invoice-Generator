// ResetPassword.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../../api/index.ts";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const navigate = useNavigate();

  // Read the token from the URL: /reset-password?token=abc123
  const token = new URLSearchParams(window.location.search).get("token");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    if (!token) {
      setMessage({ text: "Invalid reset link.", type: "error" });
      return;
    }
    if (password !== confirm) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }
    if (password.length < 8) {
      setMessage({
        text: "Password must be at least 8 characters.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token!, password);
      setMessage({
        text: "Password reset! Redirecting to sign in...",
        type: "success",
      });
      setTimeout(() => navigate("/signin"), 2000);
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.message || "Invalid or expired reset link.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // No token in URL — show a clear error rather than a broken form
  if (!token) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[var(--background)] p-4">
        <div className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Invalid Link
          </h2>
          <p className="text-[var(--muted-foreground)] mb-6">
            This reset link is missing or invalid. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-[var(--primary)] flex items-center justify-center">
              <span className="text-white font-bold text-lg">IV</span>
            </div>
            <span className="text-xl font-semibold text-[var(--foreground)]">
              Invoice Generator
            </span>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Reset your password
          </h2>
          <p className="text-[var(--muted-foreground)] mb-6">
            Enter a new password for your account.
          </p>

          {message && (
            <div
              className={`p-3 rounded-lg mb-4 text-sm border ${
                message.type === "success"
                  ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20"
                  : "bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary)] text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
