import { User } from "./user.types";
import { Semester } from "./operations.types"; // Circular dependency warning, handled by strict typing order usually, or we define minimal versions.

export interface GroupRole {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  extraData?: any;
  createdAt: string;
  semesters?: Semester[];
  roles?: GroupRole[];
  userGroups?: UserGroup[];
}

export interface UserGroup {
  id: string;
  user: User;
  group: Group;
  isCreator: boolean;
  groupRole?: GroupRole;
}
