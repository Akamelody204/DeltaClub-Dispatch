import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '../../user/user.entity';
import { ApiException } from '../../common/exceptions/api.exception';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { JwtPayload } from '../jwt-payload';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) {
      return true;
    }

    const req = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = req.user;
    if (!user) {
      throw new ApiException(
        40101,
        '未登录或 token 无效',
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (!required.includes(user.role as UserRole)) {
      throw new ApiException(
        40301,
        '无权限（角色不符）',
        HttpStatus.FORBIDDEN,
      );
    }
    return true;
  }
}
