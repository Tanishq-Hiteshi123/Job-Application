import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../entity/userRole.entity';
export const ROLE_KEY = 'Roles';

export const UserRoles = (...roles: UserRole[]) => {
  return SetMetadata(ROLE_KEY, roles);
};
