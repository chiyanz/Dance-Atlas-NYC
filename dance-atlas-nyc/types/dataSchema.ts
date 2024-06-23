import { Timestamp } from "firebase/firestore";

// Interface for the Firestore data
export interface SessionData {
  end_time: Date; // Will store as Date after conversion
  instructor: string;
  location: string;
  session_name: string;
  start_time: Date; // Will store as Date after conversion
}
