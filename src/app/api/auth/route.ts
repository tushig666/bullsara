import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Firebase Admin SDK
const auth = getAuth(adminApp);

export async function POST(request: NextRequest) {
  const { idToken } = await request.json();
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  try {
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json({ success: false, error: 'Failed to create session' }, { status: 401 });
  }
}

export async function DELETE() {
  const sessionCookie = cookies().get('session')?.value;
  if (sessionCookie) {
    cookies().delete('session');
    try {
      const decodedClaims = await auth.verifySessionCookie(sessionCookie);
      await auth.revokeRefreshTokens(decodedClaims.sub);
    } catch (error) {
      // Session cookie is invalid or expired.
      // In this case, we just clear the cookie.
    }
  }
  return NextResponse.json({ success: true });
}
