import { Timestamp } from "firebase/firestore";
import { SessionData } from "../types/dataSchema";

// convert firestore timestamp objects to supported Date objects
export function convertFirestoreDocToSessionData(doc: any): SessionData {
  return {
    start_time: (doc.start_time as Timestamp).toDate(),
    end_time: (doc.end_time as Timestamp).toDate(),
    instructor: doc.instructor,
    session_name: doc.session_name,
    url: doc.url,
  };
}
