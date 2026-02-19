import { Role, RoleHierarchy } from '@org/data';

export function hasRequiredRole(userRole: Role, requiredRole: Role): boolean {
  return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole];
}

export function canModifyTask(
  userRole: Role,
  userId: number,
  taskCreatedById: number
): boolean {
  if (userRole === Role.Owner || userRole === Role.Admin) return true;
  return userId === taskCreatedById;
}