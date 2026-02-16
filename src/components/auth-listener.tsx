'use client';

import { useEffect, useRef } from 'react';
import { onIdTokenChanged, User } from 'firebase/auth';
import { useAuth } from '@/firebase';

export function AuthListener() {
  const auth = useAuth();
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    if (!auth) return;

    // Set initial user state on component mount
    userRef.current = auth.currentUser;

    const unsubscribe = onIdTokenChanged(auth, (user) => {
      // Check if user state has actually changed to prevent redundant operations
      if (user?.uid !== userRef.current?.uid) {
        userRef.current = user;
        // The user state is managed globally by the FirebaseProvider,
        // so no further action like router.refresh() is needed here.
        // Components relying on `useUser` will automatically re-render.
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  return null; // This component doesn't render anything.
}
