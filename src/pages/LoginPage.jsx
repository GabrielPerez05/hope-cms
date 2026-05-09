import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const { signIn, signInWithGoogle, error, loading, clearError } = useAuth();

  const navigate = useNavigate();

  const validateLogin = () => {
    if (!email.trim()) return "Please enter your email address.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email address.";
    if (!password) return "Please enter your password.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    clearError();
    setFormError("");

    const validationError = validateLogin();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const success = await signIn(email, password);
    if (!success) {
      return;
    }

    navigate("/customers");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-emerald-600 px-8 py-10 text-white">
          <h1 className="text-4xl font-bold tracking-tight">Hope CMS</h1>

          <p className="mt-2 text-emerald-100">Customer Management System</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-slate-800">
            Welcome Back
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Sign in using your email and password
          </p>

          {/* Error */}
          {formError || error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {formError || error}
            </div>
          ) : null}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email Address
              </label>

              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                placeholder="Enter your email"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                placeholder="Enter your password"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200"></div>

              <span className="text-sm text-slate-400">OR</span>

              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={signInWithGoogle}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              Sign in with Google
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-slate-500">
            New to Hope CMS?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-semibold text-emerald-600 hover:underline"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
