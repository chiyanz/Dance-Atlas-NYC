import type { NextApiRequest, NextApiResponse } from "next";
import { adminDb } from "../../../utils/firebaseAdmin";
import { format } from "date-fns";
import { SessionData } from "../../../types/dataSchema";
import { convertFirestoreDocToSessionData } from "@/utils/convert_data";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SessionData[] | { error: string }>
) {
  try {
    const today = format(new Date(), "yyyy-MM-dd");
    const path = `classes/Modega/${today}`;

    const snapshot = await adminDb.collection(path).get();
    const docs: SessionData[] = snapshot.docs.map((doc) =>
      convertFirestoreDocToSessionData(doc.data())
    );

    return res.status(200).json(docs);
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({ error: "Error fetching data" });
  }
}
