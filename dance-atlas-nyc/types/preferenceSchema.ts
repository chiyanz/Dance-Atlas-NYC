// the options a user have to define their preferences
type DayOfWeek =
  | ""
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface Preferences {
  instructor?: string;
  level?: string;
  style?: string;
  dayOfWeek?: DayOfWeek;
  studio?: string;
}
