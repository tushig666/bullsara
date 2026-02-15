import 'server-only';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

export const adminApp =
  getApps().find((app) => app.name === 'admin') ||
  initializeApp(
    {
      credential: cert(serviceAccount),
    },
    'admin'
  );
