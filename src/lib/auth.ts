import 'server-only';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from './firebase/admin';
import { cookies } from 'next/headers';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/client';
import type { UserProfile } from './types';

export async function getCurrentUser() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedIdToken = await getAuth(adminApp).verifySessionCookie(sessionCookie, true);
    const userDocRef = doc(db, 'users', decodedIdToken.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error verifying session cookie:", error);
    return null;
  }
}
