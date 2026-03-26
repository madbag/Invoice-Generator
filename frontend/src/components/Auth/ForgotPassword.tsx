// ForgotPassword.tsx
import React, { useState } from "react";
import { Link } from "react-router";
import { forgotPassword } from "../../api/index.ts";

const BackArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    if (!email) {
      setMessage({ text: "Please enter your email address", type: "error" });
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setMessage({
        text: "If an account exists with this email, you will receive password reset instructions.",
        type: "success",
      });
      setEmail("");
    } catch {
      // Always show the same message to prevent email enumeration
      setMessage({
        text: "If an account exists with this email, you will receive password reset instructions.",
        type: "success",
      });
    } finally {
      setLoading(false);
    }
  };

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
          <Link
            to="/signin"
            className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6 transition-colors w-fit"
          >
            <BackArrowIcon />
            Back to sign in
          </Link>

          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Forgot password?
          </h2>
          <p className="text-[var(--muted-foreground)] mb-6">
            Enter your email and we'll send you instructions to reset your password.
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
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                placeholder="Enter your email"
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
                  Sending...
                </>
              ) : (
                "Send Reset Instructions"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};