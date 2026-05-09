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
    if (!success) return;

    navigate("/customers");
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 overflow-hidden rounded-3xl bg-slate-900/95 shadow-2xl shadow-slate-950/40 lg:grid-cols-2">
        <div className="hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-950 p-12 text-slate-100 lg:flex lg:flex-col">
          <div className="relative flex flex-1 flex-col justify-between">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-widest text-emerald-200">
                Secure login
              </span>
              <h1 className="mt-8 text-5xl font-semibold leading-tight text-white">
                Welcome back to Hope CMS
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-emerald-100/80">
                Sign in to continue managing customers, inventory, and sales
                from one polished workspace.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-5 shadow-xl shadow-black/10">
                <p className="text-sm font-semibold text-white">Fast access</p>
                <p className="mt-2 text-sm text-emerald-100/80">
                  Sign in with email or Google.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 shadow-xl shadow-black/10">
                <p className="text-sm font-semibold text-white">
                  Modern interface
                </p>
                <p className="mt-2 text-sm text-emerald-100/80">
                  Clean, professional design.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-10 shadow-2xl shadow-slate-950/20 text-slate-900">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-400/90">
              Sign In
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">
              Access your account
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Use your email and password or continue with Google.
            </p>
          </div>

          {formError || error ? (
            <div className="mb-6 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
              {formError || error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm text-slate-700">
              <span className="mb-2 block font-medium text-slate-500">
                Email
              </span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                placeholder="you@example.com"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>
            <label className="block text-sm text-slate-700">
              <span className="mb-2 block font-medium text-slate-500">
                Password
              </span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                placeholder="Enter your password"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:from-emerald-400 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-widest text-slate-500">
            <span className="h-px flex-1 bg-slate-700/70" />
            <span>Or</span>
            <span className="h-px flex-1 bg-slate-700/70" />
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:border-emerald-400/60 hover:bg-slate-800"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-emerald-700">
              G
            </span>
            Sign in with Google
          </button>

          <p className="mt-8 text-center text-sm text-slate-400">
            New to Hope CMS?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-semibold text-white underline-offset-2 transition hover:text-emerald-200"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
