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

  if (error && error.code !== "PGRST116") throw error;
  return { ...session.user, ...data };
}

function normalizeUser(userData) {
  if (!userData) return null;
  return {
    id: userData.id || userData.userId,
    email: userData.email,
    username: userData.username || userData.email,
    user_type: userData.user_type || "USER",
    record_status: userData.record_status || "INACTIVE",
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
    } catch (err) {
      setError(err.message || "Failed to load user profile.");
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

  // --- NEW FOR PR-02: EMAIL AUTH FUNCTIONS ---

  // Requirement: signIn() wired to Login form
  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return false;
    }
    return true;
  }, []);

  // Requirement: signUp() wired to Register form
  const signUp = useCallback(async (email, password, metadata) => {
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // metadata is passed to the DB trigger
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return false;
    }
    return true;
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSession(null);
    setLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Updated value to include the new functions
  const value = useMemo(
    () => ({
      currentUser,
      session,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      clearError,
    }),
    [currentUser, session, loading, error, signIn, signUp, signOut, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}