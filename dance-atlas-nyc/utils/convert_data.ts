import { Timestamp } from "firebase/firestore";
import { SessionData } from "../types/dataSchema";
import moment from "moment-timezone";

function convertToEST(timestamp: Timestamp): Date {
  const pdtTime = moment(timestamp.toDate()).tz("America/Los_Angeles");

  const estTime = pdtTime.clone().tz("America/New_York");

  // Return the Date object in EST
  return estTime.toDate();
}

// convert firestore timestamp objects to supported Date objects
export function convertFirestoreDocToSessionData(doc: any): SessionData {
  return {
    start_time: convertToEST(doc.start_time as Timestamp),
    end_time: convertToEST(doc.end_time as Timestamp),
    instructor: doc.instructor,
    session_name: doc.session_name,
    url: doc.url,
  };
}
