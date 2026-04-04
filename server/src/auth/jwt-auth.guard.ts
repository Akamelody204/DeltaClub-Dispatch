import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiException } from '../common/exceptions/api.exception';
import type { JwtPayload } from './jwt-payload';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new ApiException(
        40101,
        '未登录或 token 无效',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const token = auth.slice(7);
    try {
      req.user = this.jwt.verify<JwtPayload>(token);
      return true;
    } catch {
      throw new ApiException(
        40101,
        '未登录或 token 无效',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
