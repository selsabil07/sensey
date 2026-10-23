"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Single source of truth for signing a student out.
 * Used by both the Sidebar and the Navbar profile menu.
 */
export default function useSignOut() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  const signOut = useCallback(async () => {
    if (signingOut) return;

    setSigningOut(true);
    setError("");

    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

      router.replace("/sign-in");
      router.refresh();
    } catch (err) {
      console.error("Student sign-out error:", err);
      setError("Couldn't sign you out. Check your connection and try again.");
      setSigningOut(false);
    }
  }, [router, signingOut, supabase]);

  return { signOut, signingOut, error };
}
