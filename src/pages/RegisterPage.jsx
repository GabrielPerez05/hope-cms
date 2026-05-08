import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signUp, signInWithGoogle, error, loading, clearError } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    clearError();
    await signUp(email, password, { firstName, lastName, username });
    navigate("/auth/callback");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-semibold">Create your Hope CMS account</h1>
        <p className="mt-2 text-sm text-slate-500">
          Register with email/password or Google.
        </p>
        {error ? (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-slate-600">First Name</span>
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
                className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Last Name</span>
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
                className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="text-slate-600">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
            />
          </label>
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
            {loading ? "Registering…" : "Create account"}
          </button>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition hover:bg-slate-50"
          >
            Register with Google
          </button>
        </form>
      </div>
    </div>
  );
}
