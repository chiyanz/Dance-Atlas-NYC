import {
  initializeApp,
  applicationDefault,
  cert,
  getApps,
} from "firebase-admin/app";
import { credential } from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";

const serviceAccountPath =
  process.env.SERVICE_ACCOUNT_KEY_PATH ||
  path.resolve(
    "C:\\Users\\jonat\\Projects\\Dance-Atlas-NYC\\dance-atlas-nyc\\app\\credentials\\serviceAccountKey.json"
  );

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccountPath),
  });
}

const db = getFirestore();

export { db };
