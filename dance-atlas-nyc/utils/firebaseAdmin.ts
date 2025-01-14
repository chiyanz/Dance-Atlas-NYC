import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { type ServiceAccount, credential } from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

const getEnvVar = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};

const privateKey = getEnvVar("NEXT_PUBLIC_FIREBASE_PRIVATE_KEY").replace(
  /\\n/g,
  "\n"
);

const serViceAccountObj: ServiceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  privateKey: privateKey,
  clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
};

if (!getApps().length) {
  initializeApp({
    credential: credential.cert(serViceAccountObj),
  });
}

const db = getFirestore();
const auth = getAuth();
export { db, auth };
