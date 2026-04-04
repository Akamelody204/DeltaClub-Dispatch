import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { ApiException } from '../common/exceptions/api.exception';
import type { JwtPayload } from '../auth/jwt-payload';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: AdminLoginDto) {
    const expectedUser = this.config.get<string>('ADMIN_USERNAME');
    const hash = this.config.get<string>('ADMIN_PASSWORD_HASH');
    if (!expectedUser || !hash) {
      throw new ApiException(
        50000,
        '管理端登录未配置（请设置 ADMIN_USERNAME 与 ADMIN_PASSWORD_HASH）',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const sameUser = dto.username === expectedUser;
    const okPass =
      sameUser && (await bcrypt.compare(dto.password, hash));
    if (!sameUser || !okPass) {
      throw new ApiException(
        40001,
        '用户名或密码错误',
        HttpStatus.BAD_REQUEST,
      );
    }

    const sub = this.config.get<string>(
      'ADMIN_JWT_SUB',
      '00000000-0000-4000-8000-000000000001',
    );
    const expiresIn = Number(this.config.get('JWT_EXPIRES_IN', 604800));

    const payload: JwtPayload = {
      sub,
      role: 'admin',
      openid: '',
    };

    const accessToken = await this.jwt.signAsync(payload, { expiresIn });

    return {
      accessToken,
      tokenType: 'Bearer' as const,
      expiresIn,
      user: {
        id: sub,
        openid: '',
        role: 'admin',
        nickname: 'Administrator',
      },
    };
  }
}
