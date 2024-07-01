import { NextRequest, NextResponse } from "next/server";
import { db } from "../../utils/firebaseClient";
import { collection, getDocs } from "firebase/firestore";
import { format } from "date-fns";
import { SessionData } from "../../types/dataSchema";
import { convertFirestoreDocToSessionData } from "@/utils/convert_data";
import { fetchAndOrganizeClasses } from "@/utils/fetchData";

export async function GET() {
  try {
    const classes = await fetchAndOrganizeClasses();
    return NextResponse.json(classes);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
  }
}
