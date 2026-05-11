import { useCallback, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { AuthContext } from "./auth-context";

async function fetchAppUser(session) {
  if (!session) return null;

  const { data, error } = await supabase
    .from("user")
    .select("record_status, user_type, username")
    .eq("userId", session.user.id)
    .maybeSingle();

  if (error) {
    console.warn("Could not load CMS user profile:", error.message);
    return null;
  }

  return { ...session.user, ...data };
}

function normalizeUser(userData) {
  if (!userData) return null;
  const metadata = userData.user_metadata || {};

  return {
    id: userData.id || userData.userId,
    email: userData.email,
    username:
      userData.username ||
      metadata.username ||
      metadata.full_name ||
      metadata.name ||
      userData.email,
    user_type: userData.user_type || "USER",
    record_status: userData.record_status || "ACTIVE",
  };
}

export function AuthProvider({ children }) {
  const configurationError = isSupabaseConfigured
    ? null
    : "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local.";
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(configurationError);

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

      setCurrentUser(normalized);
    } catch (err) {
      setError(err.message || "Failed to load user profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) loadSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setTimeout(() => {
          if (isMounted) loadSession(nextSession);
        }, 0);
      },
    );

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [loadSession]);

  // --- PR-02: EMAIL AUTH FUNCTIONS ---
  const signIn = useCallback(
    async (email, password) => {
      if (!isSupabaseConfigured) {
        setError("Supabase is not configured.");
        return false;
      }

      setLoading(true);
      setError(null);
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        },
      );
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return false;
      }

      await loadSession(data.session);
      return true;
    },
    [loadSession],
  );

  const signUp = useCallback(
    async (email, password, metadata) => {
      if (!isSupabaseConfigured) {
        setError("Supabase is not configured.");
        return false;
      }

      setLoading(true);
      setError(null);
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return false;
      }

      await loadSession(data.session);
      return Boolean(data.session);
    },
    [loadSession],
  );

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Redirects back to your callback route
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
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
      loadSession,
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
      loadSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
