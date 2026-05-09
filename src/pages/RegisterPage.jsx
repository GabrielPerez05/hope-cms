import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const { signUp, signInWithGoogle, error, loading, clearError } = useAuth();
  const navigate = useNavigate();

  const validateRegister = () => {
    if (!firstName.trim()) return "Please enter your first name.";
    if (!lastName.trim()) return "Please enter your last name.";
    if (!username.trim()) return "Please choose a username.";
    if (username.trim().length < 3)
      return "Username must be at least 3 characters.";
    if (!email.trim()) return "Please enter your email address.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email address.";
    if (!password) return "Please enter a password.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    return "";
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    clearError();
    setFormError("");

    const validationError = validateRegister();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const success = await signUp(email, password, {
      firstName,
      lastName,
      username,
    });
    if (!success) return;

    navigate("/auth/callback");
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 overflow-hidden rounded-3xl bg-slate-900/95 shadow-2xl shadow-slate-950/40 lg:grid-cols-2">
        <div className="hidden rounded-3xl bg-white p-12 text-slate-950 lg:flex lg:flex-col">
          <div className="relative flex flex-1 flex-col justify-between">
            <div>
              <span className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-xs uppercase tracking-widest text-emerald-700">
                Create your workspace
              </span>
              <h1 className="mt-8 text-5xl font-semibold leading-tight">
                Register for Hope CMS
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600">
                Set up a secure account and start managing customers, products,
                and sales in a polished dashboard.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">
                  Easy onboarding
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Complete your profile in moments.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">
                  Secure by default
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Strong auth and safe storage.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">
                  Enterprise-ready
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Designed for teams and growth.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-950/95 p-10 shadow-2xl shadow-slate-950/30">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-400/90">
              Sign Up Account
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Enter your personal data to create your account.
            </p>
          </div>

          {formError || error ? (
            <div className="mb-6 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
              {formError || error}
            </div>
          ) : null}

          <div className="space-y-4">
            <button
              type="button"
              onClick={signInWithGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm font-semibold text-white transition hover:border-emerald-400/60 hover:bg-slate-800"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-emerald-700">
                G
              </span>
              Register with Google
            </button>
          </div>

          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-widest text-slate-500">
            <span className="h-px flex-1 bg-slate-700/70" />
            <span>Or</span>
            <span className="h-px flex-1 bg-slate-700/70" />
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block text-slate-400">First Name</span>
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  placeholder="eg. John"
                  className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
                />
              </label>
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block text-slate-400">Last Name</span>
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                  placeholder="eg. Francisco"
                  className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
                />
              </label>
            </div>

            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-slate-400">Username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                placeholder="Choose a username"
                className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
              />
            </label>

            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-slate-400">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                placeholder="eg. johnfran@gmail.com"
                className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
              />
            </label>

            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-slate-400">Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                placeholder="Enter your password"
                className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
              />
              <span className="mt-2 block text-xs text-slate-500">
                Must be at least 8 characters.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:from-emerald-400 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Registering..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-semibold text-white underline-offset-2 transition hover:text-emerald-200"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
