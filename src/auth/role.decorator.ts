import { SetMetadata } from '@nestjs/common';
import { USER_ROLE } from '../users/role.enum';

export const Roles = (...roles: USER_ROLE[]) => SetMetadata('roles', roles);
