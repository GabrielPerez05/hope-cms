import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function AuthCallbackPage() {
  const [message, setMessage] = useState("Processing authentication...");
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      const { error } = await supabase.auth.getSessionFromUrl({
        storeSession: true,
      });
      if (error) {
        setMessage(error.message);
        navigate(`/login?error=${encodeURIComponent(error.message)}`);
        return;
      }
      navigate("/customers");
    }

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold">OAuth callback</p>
        <p className="mt-3 text-slate-600">{message}</p>
      </div>
    </div>
  );
}
