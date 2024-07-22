import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/utils/firebaseClient";
import { doc, getDoc } from "firebase/firestore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  try {
    const userDoc = await getDoc(doc(firestore, "users", uid!));
    if (userDoc.exists()) {
      return new NextResponse(JSON.stringify(userDoc.data()), { status: 200 });
    } else {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
