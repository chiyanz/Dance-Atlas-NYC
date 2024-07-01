import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../utils/firebaseAdmin";
import { format } from "date-fns";
import { SessionData } from "../../../types/dataSchema";
import { convertFirestoreDocToSessionData } from "@/utils/convert_data";

export async function GET(req: NextRequest) {
  console.log("hello from api/classes");
  try {
    const today = format(new Date(), "yyyy-MM-dd");
    const path = `classes/Modega/${today}`;

    const snapshot = await adminDb.collection(path).get();
    const docs: SessionData[] = snapshot.docs.map((doc) =>
      convertFirestoreDocToSessionData(doc.data())
    );

    return NextResponse.json(docs);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
  }
}
