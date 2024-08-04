import { NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/firebaseAdmin";

export async function POST(req: NextRequest) {
  const { uid, preferences } = await req.json();

  try {
    const userDocRef = db.collection("users").doc(uid);
    console.log(uid, preferences);
    await userDocRef.update({ preferences });
    return new NextResponse(
      JSON.stringify({ message: "Preferences updated successfully" }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
