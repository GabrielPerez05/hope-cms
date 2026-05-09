import { useCallback, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { AuthContext } from "./auth-context";

async function fetchAppUser(session) {
  if (!session) {
    return null;
  }

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
    id: userData.id,
    email: userData.email,
    username: userData.username || userData.email,
    user_type: userData.user_type || "USER",
    record_status: userData.record_status || "ACTIVE",
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
        setError("Your account is pending activation or is inactive.");
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

    const initialSession = supabase.auth.getSession().then(({ data }) => {
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

    setLoading(false);
    return true;
  }, []);

  const signUp = useCallback(async (email, password, metadata) => {
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (authError) {
      setError(authError.message);
    }

    setLoading(false);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          access_type: "offline",
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSession(null);
    setLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      session,
      loading,
      error,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      clearError,
    }),
    [
      currentUser,
      session,
      loading,
      error,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
