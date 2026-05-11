import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function AuthCallbackPage() {
  const [message, setMessage] = useState("Completing authentication...");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      const { error } = await supabase.auth.getSessionFromUrl({
        storeSession: true,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        navigate(`/login?error=${encodeURIComponent(error.message)}`);
        return;
      }

      setLoading(false);
      navigate("/customers");
    }

    handleCallback();
  }, [navigate]);

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
