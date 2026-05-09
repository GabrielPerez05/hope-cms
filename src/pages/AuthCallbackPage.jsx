import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function AuthCallbackPage() {
  const [message, setMessage] = useState("Processing authentication...");
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="flex items-center justify-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <div className="text-left">
            <p className="text-lg font-semibold">Processing authentication</p>
            <p className="mt-2 text-sm text-slate-600">{message}</p>
          </div>
        </div>
        {!loading && (
          <p className="mt-6 text-sm text-rose-600">
            If the redirect did not happen automatically, please refresh the page.
          </p>
        )}
      </div>
    </div>
  );
}
