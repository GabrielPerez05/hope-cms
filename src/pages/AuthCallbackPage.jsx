import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export function AuthCallbackPage() {
  const [status, setStatus] = useState("loading");
  const hasHandledCallback = useRef(false);
  const { loadSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      if (hasHandledCallback.current) return;
      hasHandledCallback.current = true;

      if (!isSupabaseConfigured) {
        const msg = "Supabase is not configured.";
        navigate(`/login?error=${encodeURIComponent(msg)}`, { replace: true });
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const urlError = params.get("error_description") || params.get("error");

      if (urlError) {
        navigate(`/login?error=${encodeURIComponent(urlError)}`, { replace: true });
        return;
      }

      let authResult;
      if (code) {
        authResult = await supabase.auth.exchangeCodeForSession(code);
      } else {
        authResult = await supabase.auth.getSession();
      }

      const session = authResult.data.session;
      const authError = authResult.error;

      if (authError) {
        navigate(`/login?error=${encodeURIComponent(authError.message)}`, { replace: true });
        return;
      }

      const sessionResult = await loadSession(session);
      if (!sessionResult?.ok) {
        const errorMessage = sessionResult?.error || "Your account could not be activated.";
        if (errorMessage.includes("pending activation")) {
          setStatus("pending");
        } else {
          navigate(`/login?error=${encodeURIComponent(errorMessage)}`, { replace: true });
        }
        return;
      }

      navigate("/customers", { replace: true });
    }

    handleCallback();
  }, [loadSession, navigate]);

  if (status === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-100 via-white to-emerald-50 px-4 py-10">
        <div className="mx-auto w-full max-w-lg overflow-hidden rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-[0_25px_80px_-40px_rgba(4,120,87,0.35)]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-900">Account created</p>
              <p className="mt-2 text-sm text-slate-600">
                Your account has been registered and is pending activation.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[1.75rem] bg-emerald-50 p-5 text-sm text-slate-700">
            <p className="font-semibold text-emerald-700">What happens next?</p>
            <p className="mt-2 leading-6 text-slate-600">
              A Sales Manager or Admin will review and activate your account.
              Once activated, you can sign in using the same Google account.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="mt-6 w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-white to-emerald-50 px-4 py-10">
      <div className="mx-auto w-full max-w-lg overflow-hidden rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-[0_25px_80px_-40px_rgba(4,120,87,0.35)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-900">Authenticating</p>
            <p className="mt-2 text-sm text-slate-600">Completing authentication...</p>
          </div>
        </div>

        <div className="mt-8 rounded-[1.75rem] bg-emerald-50 p-5 text-sm text-slate-700">
          <p className="font-semibold text-emerald-700">One moment please.</p>
          <p className="mt-2 text-slate-600">
            You will be redirected to your dashboard automatically once sign-in completes.
          </p>
        </div>
      </div>
    </div>
  );
}
