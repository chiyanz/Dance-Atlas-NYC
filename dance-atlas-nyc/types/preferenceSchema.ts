// The options a user has to define their preferences
export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type Studio =
  | "Peri"
  | "BDC"
  | "Modega"
  | "Brickhouse"
  | "ILoveDanceManhattan";

export interface Preferences {
  instructor: string;
  level: string;
  style: string;
  dayOfWeek: Set<DayOfWeek>;
  studio: Set<Studio>;
}
