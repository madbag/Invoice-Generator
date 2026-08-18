import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { signIn, resendVerification } from "../../api/index.ts";
import { useAuth } from "../../context/AuthContext.tsx";

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState<
    "idle" | "sending" | "sent"
  >("idle");
  const navigate = useNavigate();
  const { signIn: authSignIn } = useAuth();
  const [searchParams] = useSearchParams();
  const verified = searchParams.get("verified");
  const registered = searchParams.get("registered");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setNeedsVerification(false);
    setResendStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);

    if (!formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const { data } = await signIn(formData);
      authSignIn(data);
      navigate("/dashboard");
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("This user does not exist");
      } else if (err.response?.status === 403) {
        setError(err.response.data.message);
        setNeedsVerification(true);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred during sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendStatus("sending");
    try {
      await resendVerification(formData.email);
      setResendStatus("sent");
    } catch {
      setResendStatus("idle");
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-[var(--primary)] flex items-center justify-center">
              <span className="text-white font-bold text-lg">IV</span>
            </div>
            <span className="text-xl font-semibold text-[var(--foreground)]">
              Invoice Generator
            </span>
          </Link>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-xl md:text-2xl font-bold text-center text-[var(--foreground)] mb-2">
            Welcome
          </h2>
          <p className="text-center text-[var(--muted-foreground)] mb-6 md:text-lg text-sm">
            Sign in to your account to continue
          </p>

          {registered === "true" && (
            <div className="bg-green-500/10 text-green-600 p-3 rounded-lg mb-4 text-sm border border-green-500/20">
              Account created! Please check your email to verify your email id before signing in.
            </div>
          )}

          {verified === "true" && (
            <div className="bg-green-500/10 text-green-600 p-3 rounded-lg mb-4 text-sm border border-green-500/20">
              Email verified successfully! You can now sign in.
            </div>
          )}
          {verified === "false" && (
            <div className="bg-[var(--destructive)]/10 text-[var(--destructive)] p-3 rounded-lg mb-4 text-sm border border-[var(--destructive)]/20">
              This verification link is invalid or has expired.
            </div>
          )}

          {error && (
            <div className="bg-[var(--destructive)]/10 text-[var(--destructive)] p-3 rounded-lg mb-4 text-sm border border-[var(--destructive)]/20">
              <p>{error}</p>
              {needsVerification && (
                <div className="mt-2">
                  {resendStatus === "sent" ? (
                    <p className="text-[var(--foreground)]">
                      Verification email sent — check your inbox.
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendStatus === "sending"}
                      className="text-[var(--primary)] hover:underline font-medium disabled:opacity-50"
                    >
                      {resendStatus === "sending"
                        ? "Sending..."
                        : "Resend verification email"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors text-sm md:text-base"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[var(--foreground)] ">
                  Password
                </label>
                {/* Now just a link to the dedicated page */}
                <Link
                  to="/forgot-password"
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 pr-12 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors text-sm md:text-base"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary)] text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-sm text-center mt-6 text-[var(--muted-foreground)]">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[var(--primary)] hover:underline font-medium text-sm"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3l18 18M10.584 10.587a2 2 0 002.828 2.83M9.363 5.365A9.466 9.466 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.523 10.523 0 01-2.043 3.568M6.228 6.228A10.45 10.45 0 002.458 12c1.274 4.057 5.065 7 9.542 7a9.46 9.46 0 003.639-.727"
    />
  </svg>
);

export default SignIn;
