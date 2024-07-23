import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/utils/firebaseClient";
import { doc, updateDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  const { uid, preferences } = await req.json();

  try {
    const userDoc = doc(firestore, "users", uid);
    console.log(uid, preferences);
    await updateDoc(userDoc, { preferences });
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
