import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/utils/firebaseAdmin";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  try {
    const userRecord = await auth.getUserByEmail(email);
    const userDoc = await db.collection("users").doc(userRecord.uid).get();
    const user = userDoc.data();

    if (!user || !user.password) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 400,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 400 }
      );
    }

    // Create a custom token
    const token = await auth.createCustomToken(userRecord.uid);

    return new NextResponse(JSON.stringify({ token }), {
      status: 200,
    });
  } catch (error: any) {
    if (error instanceof Error) {
      return new NextResponse(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    } else {
      return new NextResponse(
        JSON.stringify({ error: "Unknown error occurred" }),
        {
          status: 500,
        }
      );
    }
  }
}
