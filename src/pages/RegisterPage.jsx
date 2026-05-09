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
    if (!success) {
      return;
    }

    navigate("/auth/callback");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-semibold">Create your Hope CMS account</h1>
        <p className="mt-2 text-sm text-slate-500">
          Register with email/password or Google.
        </p>
        {formError || error ? (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
            {formError || error}
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
