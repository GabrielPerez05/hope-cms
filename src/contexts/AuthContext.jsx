import { useCallback, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { AuthContext } from "./auth-context";

async function fetchAppUser(session) {
  if (!session) return null;

  const { data, error } = await supabase
    .from("user")
    .select("record_status, user_type, username")
    .eq("userId", session.user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return { ...session.user, ...data };
}

function normalizeUser(userData) {
  if (!userData) return null;
  return {
    id: userData.id || userData.userId,
    email: userData.email,
    username: userData.username || userData.email,
    user_type: userData.user_type || "USER",
    record_status: userData.record_status || "INACTIVE", // Default to INACTIVE for safety
  };
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(null);

  const loadSession = useCallback(async (nextSession) => {
    setLoading(true);
    setError(null);

    try {
      setSession(nextSession);

      if (!nextSession) {
        setCurrentUser(null);
        return;
      }

      const appUser = await fetchAppUser(nextSession);
      const normalized = normalizeUser(appUser || nextSession.user);

      if (normalized?.record_status !== "ACTIVE") {
        await supabase.auth.signOut();
        setCurrentUser(null);
        setError("Your account is pending activation by a Sales Manager.");
        return;
      }

      setCurrentUser(normalized);
    } catch (fetchError) {
      setError(fetchError.message || "Failed to load user profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      loadSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        await loadSession(nextSession);
      },
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [loadSession]);

  const value = useMemo(
    () => ({
      currentUser,
      session,
      loading,
      error,
    }),
    [currentUser, session, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}