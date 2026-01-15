import { User } from "./user.types";

export interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  activities?: Activity[];
  positions?: Position[];
}

export interface Position {
  id: string;
  name: string;
  description?: string;
}

export interface Activity {
  id: string;
  name: string;
  date: string;
  description?: string;
  location: string;
  assignments?: Assignment[];
}

export interface Assignment {
  id: string;
  activity?: Activity;
  position: Position;
  user: User;
  notes?: string;
}
