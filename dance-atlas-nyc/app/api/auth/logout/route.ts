// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth, signOut } from "firebase/auth";
import cookie from "cookie";
import { initializeApp, getApps } from "firebase/app";

// Ensure Firebase is initialized
if (!getApps().length) {
  initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  });
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuth();
    await signOut(auth);

    return new NextResponse(
      JSON.stringify({ message: "Logged out successfully" }),
      {
        headers: {
          "Set-Cookie": cookie.serialize("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            maxAge: -1, // Expire the cookie immediately
            sameSite: "strict",
            path: "/",
          }),
        },
      }
    );
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
