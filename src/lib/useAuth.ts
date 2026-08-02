"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, isConfigured } from "./firebase";
import { useRouter } from "next/navigation";

export function useAuth(requireAuth = false) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isConfigured) {
      // Mock user for preview
      setUser({ email: "admin@preview.com", uid: "mock-uid" } as User);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      if (requireAuth && !user) {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [requireAuth, router]);

  return { user, loading };
}
