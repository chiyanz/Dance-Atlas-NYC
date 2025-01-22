// Interface for the Firestore data
export interface SessionData {
  end_time: Date; // Will store as Date after conversion
  instructor: string;
  level?: string;
  location?: string;
  session_name: string;
  start_time: Date; // Will store as Date after conversion
  url?: string;
}

export interface OrganizedData {
  [studioName: string]: {
    [date: string]: SessionData[];
  };
}

export interface SearchOptions {
  studio?: Array<string>;
  start_date?: Date;
  searchField?: keyof SessionData;
  searchRegex?: string;
}

type SessionDataKeys = keyof SessionData;
export const sessionDataKeys: SessionDataKeys[] = [
  "end_time",
  "instructor",
  "level",
  "location",
  "session_name",
  "start_time",
];