'use client';

import { useEffect, useRef } from 'react';
import { onIdTokenChanged, User } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';

// This function communicates with our server-side API route to set/clear the session cookie.
async function syncSessionCookie(idToken: string | null) {
  await fetch('/api/auth', {
    method: idToken ? 'POST' : 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: idToken ? JSON.stringify({ idToken }) : undefined,
  });
}

export function AuthListener() {
  const auth = useAuth();
  const router = useRouter();
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    if (!auth) return;

    // Set initial user state on component mount
    userRef.current = auth.currentUser;

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      // Check if user state has actually changed to prevent redundant operations
      if (user?.uid !== userRef.current?.uid) {
        userRef.current = user;
        const idToken = user ? await user.getIdToken() : null;
        await syncSessionCookie(idToken);
        router.refresh();
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, router]);

  return null; // This component doesn't render anything.
}
