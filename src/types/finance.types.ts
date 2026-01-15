import { User } from "./user.types";

export interface Goal {
  id: string;
  name: string;
  description?: string;
  purpose?: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string; // ISO Date
  endDate?: string; // ISO Date
  isActive: boolean;
  sales?: Sale[];
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  name: string;
  description?: string;
  date: string;
  location?: string;
  totalAmount: number;
  goalId?: string; // Sometimes we just have the ID ref
  columns?: SaleColumn[];
  rows?: SaleRow[];
  createdAt: string;
  updatedAt: string;
}

export enum SaleColumnType {
  TEXT = "TEXT",
  NUMBER = "NUMBER",
  DATE = "DATE",
}

export interface SaleColumn {
  id: string;
  name: string;
  type: SaleColumnType;
  isRequired: boolean;
  isFunctionalAmount: boolean;
  orderIndex: number;
}

export interface SaleRow {
  id: string;
  addedByUserId?: string;
  addedBy?: User;
  values: SaleValue[];
  createdAt: string;
}

export interface SaleValue {
  id: string;
  value: string;
  columnId: string; // Helper to link back if needed, or we rely on structure
  // In backend: column: SaleColumn. In frontend often useful to just have the ID or the full object.
  // The API usually returns the relations.
  column?: SaleColumn;
}
