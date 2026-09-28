"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

interface AuthState {
  session: Session | null;
  user: User | null;
  /** True until the very first auth check (including URL magic-link
   * exchange) has resolved. Every page must wait for this before deciding
   * "logged out" — checking too early is what caused the old "locked" bug. */
  loading: boolean;
}

const AuthContext = createContext<AuthState>({ session: null, user: null, loading: true });

/**
 * Single source of truth for auth state, subscribed once at the app root.
 * Every page reads `user` from here instead of calling supabase.auth.getUser()
 * itself — that pattern is what caused the "add trip does nothing" bug:
 * a fresh getUser() call right after landing from the magic-link redirect
 * could race the session still being parsed from the URL and come back null,
 * silently no-op'ing the whole action with no error shown.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, user: null, loading: true });

  useEffect(() => {
    let mounted = true;

    // getSession() also completes any pending magic-link exchange from the URL.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setState({ session, user: session?.user ?? null, loading: false });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState({ session, user: session?.user ?? null, loading: false });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
