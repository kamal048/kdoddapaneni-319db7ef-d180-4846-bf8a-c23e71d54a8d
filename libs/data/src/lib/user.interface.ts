import { Role } from './role.enum';

export interface IUser {
  id: number;
  email: string;
  role: Role;
  organizationId: number;
}