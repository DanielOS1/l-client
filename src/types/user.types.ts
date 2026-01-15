export interface User {
  id: string;
  firstName: string;
  lastName: string;
  rut: string;
  occupation?: string;
  phone?: string;
  address?: string;
  birthDate?: string; // Date sent as ISO string from API
  email: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
}
