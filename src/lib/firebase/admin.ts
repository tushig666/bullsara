import 'server-only';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

export const adminApp =
  getApps().find((app) => app.name === 'admin') ||
  initializeApp(
    serviceAccount ? { credential: cert(serviceAccount) } : undefined,
    'admin'
  );
