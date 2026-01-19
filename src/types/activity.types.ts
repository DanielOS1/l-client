import { Semester } from "./operations.types";

export interface Activity {
  id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  semester?: Semester;
  semesterId: string;
}
