'use client';

import { useEffect } from 'react';
import { getAuth, onIdTokenChanged } from 'firebase/auth';
import { app } from '@/lib/firebase/client';

// Initialize auth only once
const auth = getAuth(app);

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
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      const idToken = user ? await user.getIdToken() : null;
      await syncSessionCookie(idToken);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return null; // This component doesn't render anything.
}
