export enum Role {
    Owner = 'owner',
    Admin = 'admin',
    Viewer = 'viewer',
  }
  
  export const RoleHierarchy = {
    [Role.Owner]: 3,
    [Role.Admin]: 2,
    [Role.Viewer]: 1,
  };