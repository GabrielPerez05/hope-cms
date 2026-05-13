<<<<<<< HEAD
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export function AuthCallbackPage() {
  const [message, setMessage] = useState("Completing authentication...");
  const hasHandledCallback = useRef(false);
  const { loadSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      if (hasHandledCallback.current) return;
      hasHandledCallback.current = true;

      if (!isSupabaseConfigured) {
        const errorMessage = "Supabase is not configured.";
        setMessage(errorMessage);
        navigate(`/login?error=${encodeURIComponent(errorMessage)}`, {
          replace: true,
        });
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const urlError = params.get("error_description") || params.get("error");

      if (urlError) {
        setMessage(urlError);
        navigate(`/login?error=${encodeURIComponent(urlError)}`, {
          replace: true,
        });
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
        setMessage(authError.message);
        navigate(`/login?error=${encodeURIComponent(authError.message)}`, {
          replace: true,
        });
        return;
      }

      await loadSession(session);
      navigate("/customers", { replace: true });
    }

    handleCallback();
  }, [loadSession, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-white to-emerald-50 px-4 py-10">
      <div className="mx-auto w-full max-w-lg overflow-hidden rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-[0_25px_80px_-40px_rgba(4,120,87,0.35)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-900">
              Authenticating
            </p>
            <p className="mt-2 text-sm text-slate-600">{message}</p>
          </div>
        </div>

        <div className="mt-8 rounded-[1.75rem] bg-emerald-50 p-5 text-sm text-slate-700">
          <p className="font-semibold text-emerald-700">One moment please.</p>
          <p className="mt-2 text-slate-600">
            You will be redirected to your dashboard automatically once sign-in
            completes.
          </p>
        </div>
      </div>
    </div>
  );
}
=======
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export function AuthCallbackPage() {
  const [message, setMessage] = useState("Completing authentication...");
  const hasHandledCallback = useRef(false);
  const { loadSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      if (hasHandledCallback.current) return;
      hasHandledCallback.current = true;

      if (!isSupabaseConfigured) {
        const errorMessage = "Supabase is not configured.";
        setMessage(errorMessage);
        navigate(`/login?error=${encodeURIComponent(errorMessage)}`, {
          replace: true,
        });
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const urlError = params.get("error_description") || params.get("error");

      if (urlError) {
        setMessage(urlError);
        navigate(`/login?error=${encodeURIComponent(urlError)}`, {
          replace: true,
        });
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
        setMessage(authError.message);
        navigate(`/login?error=${encodeURIComponent(authError.message)}`, {
          replace: true,
        });
        return;
      }

      await loadSession(session);
      navigate("/customers", { replace: true });
    }

    handleCallback();
  }, [loadSession, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-white to-emerald-50 px-4 py-10">
      <div className="mx-auto w-full max-w-lg overflow-hidden rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-[0_25px_80px_-40px_rgba(4,120,87,0.35)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-900">
              Authenticating
            </p>
            <p className="mt-2 text-sm text-slate-600">{message}</p>
          </div>
        </div>

        <div className="mt-8 rounded-[1.75rem] bg-emerald-50 p-5 text-sm text-slate-700">
          <p className="font-semibold text-emerald-700">One moment please.</p>
          <p className="mt-2 text-slate-600">
            You will be redirected to your dashboard automatically once sign-in
            completes.
          </p>
        </div>
      </div>
    </div>
  );
}
>>>>>>> 535af6926ae60f228da74f82990a30ff8a584b19
