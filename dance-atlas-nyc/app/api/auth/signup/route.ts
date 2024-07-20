import { NextRequest, NextResponse } from "next/server";
import { db, auth } from "@/utils/firebaseAdmin";
import bcrypt from "bcryptjs";
import cookie from "cookie";
import { FirebaseError } from "firebase-admin";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const userRecord = await auth.createUser({
      email,
      password: hashedPassword,
    });

    await db.collection("users").doc(userRecord.uid).set({
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    });

    return new NextResponse(JSON.stringify({ message: "User created" }), {
      headers: {
        "Set-Cookie": cookie.serialize("token", userRecord.uid, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== "development",
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "strict",
          path: "/",
        }),
      },
    });
  } catch (error) {
    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 400,
    });
  }
}
