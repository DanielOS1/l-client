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

export interface ActivityPosition {
  id: string;
  activityId: string;
  positionId: string;
  quantity: number;
  position?: Position;
}

export interface Activity {
  id: string;
  name: string;
  date: string;
  description?: string;
  location: string;
  assignments?: Assignment[];
  activityPositions?: ActivityPosition[];
}

export interface Assignment {
  id: string;
  activity?: Activity;
  position: Position;
  user: User;
  notes?: string;
}
