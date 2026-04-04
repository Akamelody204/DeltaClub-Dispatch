import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../../user/user.entity';

export const ROLES_KEY = 'roles';

/** 须与 {@link JwtAuthGuard} 同用；未登录先 401，角色不符 40301 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
