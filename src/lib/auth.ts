import 'server-only';
import { getAuth } from 'firebase-admin/auth';
import { adminApp, adminDb } from './firebase/admin';
import { cookies } from 'next/headers';
import type { UserProfile } from './types';

export async function getCurrentUser(): Promise<UserProfile | null> {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedIdToken = await getAuth(adminApp).verifySessionCookie(sessionCookie, true);
    const userDocRef = adminDb.collection('users').doc(decodedIdToken.uid);
    const userDocSnap = await userDocRef.get();

    if (userDocSnap.exists) {
      const data = userDocSnap.data();
      if (data) {
        return { 
          id: userDocSnap.id,
          email: data.email,
          role: data.role,
          createdAt: data.createdAt,
        } as UserProfile; // The Timestamp from admin SDK is compatible enough for server components
      }
    }
    return null;
  } catch (error) {
    // Error verifying cookie, e.g., it's expired.
    // This is a normal case, so we don't need to log it as an error.
    return null;
  }
}
