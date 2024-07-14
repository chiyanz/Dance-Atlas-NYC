import { db } from "./firebaseAdmin";
import { SessionData } from "@/types/dataSchema";
import { convertFirestoreDocToSessionData } from "./convert_data";

interface OrganizedData {
  [studioName: string]: {
    [date: string]: SessionData[];
  };
}

export async function fetchAndOrganizeClasses(): Promise<OrganizedData> {
  const organizedData: OrganizedData = {};

  const classesRef = db.collection("classes");
  const studioDocs = await classesRef.listDocuments();
  const studioNames = studioDocs.map((doc) => doc.id);
  for (const studioName of studioNames) {
    organizedData[studioName] = {};

    const studioDocRef = db.collection("classes").doc(studioName);

    // List all collections under the studio document
    const dateCollections = await studioDocRef.listCollections();

    for (const dateCollection of dateCollections) {
      const date = dateCollection.id;
      organizedData[studioName][date] = [];

      // Fetch all classes for this date collection
      const classesSnapshot = await dateCollection.get();

      const classDataArray = classesSnapshot.docs.map((doc) =>
        convertFirestoreDocToSessionData(doc.data())
      );

      organizedData[studioName][date] = classDataArray;
    }
  }

  return organizedData;
}
