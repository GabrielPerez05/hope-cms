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
    <div className="relative min-h-screen overflow-hidden bg-[#07120f] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.28),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(56,189,248,0.18),transparent_28%),linear-gradient(135deg,#07120f_0%,#0f172a_52%,#022c22_100%)]" />
      <div className="absolute left-12 top-16 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative hidden min-h-[720px] overflow-hidden bg-slate-950/50 p-10 text-slate-100 lg:flex lg:flex-col">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />
            <div className="absolute right-20 top-20 h-16 w-16 rounded-full bg-emerald-300/15 blur-xl" />

            <div className="relative flex flex-1 flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-base font-bold text-slate-950 shadow-lg shadow-emerald-950/30">
                    H
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-white">
                      Hope, INC.
                    </p>
                    <p className="text-sm text-emerald-100/70">
                      Customer Management System
                    </p>
                  </div>
                </div>

                <span className="mt-14 inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100 shadow-lg shadow-emerald-950/20">
                  Create workspace access
                </span>
                <h1 className="mt-7 max-w-xl text-5xl font-semibold leading-tight tracking-tight text-white">
                  Start with a workspace built for focused teams.
                </h1>
                <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
                  Set up a secure account and start managing customers,
                  products, and sales from one polished dashboard.
                </p>
              </div>

              <div className="space-y-5">
                <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-5 shadow-2xl shadow-black/20">
                  <p className="text-sm font-semibold text-white">
                    Workspace setup
                  </p>
                  <div className="mt-5 space-y-4">
                    {[
                      ["1", "Create your secure profile"],
                      ["2", "Confirm your account details"],
                      ["3", "Open the Hope CMS dashboard"],
                    ].map(([step, label]) => (
                      <div key={step} className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-300/15 text-xs font-bold text-emerald-100">
                          {step}
                        </span>
                        <span className="text-sm text-slate-300">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    ["Fast", "Onboarding"],
                    ["Secure", "Auth"],
                    ["Team", "Ready"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-xl shadow-black/10"
                    >
                      <p className="text-lg font-semibold text-white">
                        {value}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white px-6 py-8 text-slate-900 shadow-2xl shadow-black/20 sm:px-10 lg:px-12 lg:py-12">
            <div className="mb-8">
              <div className="mb-8 flex items-center justify-between lg:hidden">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-bold text-white">
                    H
                  </span>
                  <div>
                    <p className="font-semibold text-slate-950">Hope, INC.</p>
                    <p className="text-xs text-slate-500">
                      Customer Management System
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
                New account
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Create your account
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                Add your profile details to prepare your secure Hope CMS
                workspace.
              </p>
            </div>

            {formError || error ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
                {formError || error}
              </div>
            ) : null}

            <div className="space-y-4">
              <button
                type="button"
                onClick={signInWithGoogle}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-emerald-700 shadow-sm">
                  G
                </span>
                Register with Google
              </button>
            </div>

            <div className="my-6 flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              <span>Or</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm text-slate-700">
                  <span className="mb-2 block font-semibold text-slate-700">
                    First name
                  </span>
                  <input
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                    placeholder="John"
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  />
                </label>
                <label className="block text-sm text-slate-700">
                  <span className="mb-2 block font-semibold text-slate-700">
                    Last name
                  </span>
                  <input
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                    placeholder="Francisco"
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  />
                </label>
              </div>

              <label className="block text-sm text-slate-700">
                <span className="mb-2 block font-semibold text-slate-700">
                  Username
                </span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  placeholder="Choose a username"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
              </label>

              <label className="block text-sm text-slate-700">
                <span className="mb-2 block font-semibold text-slate-700">
                  Email
                </span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
              </label>

              <label className="block text-sm text-slate-700">
                <span className="mb-2 block font-semibold text-slate-700">
                  Password
                </span>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  required
                  placeholder="Enter your password"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
                <span className="mt-2 block text-xs font-medium text-slate-500">
                  Must be at least 8 characters.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3.5 text-sm font-semibold text-white shadow-xl shadow-emerald-700/25 transition hover:-translate-y-0.5 hover:from-emerald-500 hover:to-teal-500 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold text-emerald-700 underline-offset-4 transition hover:text-emerald-600 hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
