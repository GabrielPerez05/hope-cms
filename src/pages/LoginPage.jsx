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
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-semibold">Login to Hope CMS</h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in using email/password or Google OAuth.
        </p>
        {(formError || error) ? (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
            {formError || error}
          </div>
        ) : null}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-slate-600">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition hover:bg-slate-50"
          >
            Sign in with Google
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-500">
          New to Hope CMS?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-slate-900 underline"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
