import { NextResponse } from "next/server";
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
