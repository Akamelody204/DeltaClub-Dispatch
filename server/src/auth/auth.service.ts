import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../user/user.entity';
import { WechatService } from '../wechat/wechat.service';
import type { JwtPayload } from './jwt-payload';

export interface AuthSessionData {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: {
    id: string;
    openid: string;
    role: string;
    nickname?: string;
    avatarUrl?: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly wechat: WechatService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async loginWithWechatCode(code: string): Promise<AuthSessionData> {
    const wx = await this.wechat.code2Session(code);

    let user = await this.users.findOne({ where: { openid: wx.openid } });
    if (!user) {
      user = this.users.create({
        openid: wx.openid,
        role: 'player' as UserRole,
        nickname: null,
        avatarUrl: null,
      });
      await this.users.save(user);
    }

    const expiresIn = Number(this.config.get('JWT_EXPIRES_IN', 604800));

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      openid: user.openid,
    };

    const accessToken = await this.jwt.signAsync(payload, { expiresIn });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user: {
        id: user.id,
        openid: user.openid,
        role: user.role,
        nickname: user.nickname ?? undefined,
        avatarUrl: user.avatarUrl ?? undefined,
      },
    };
  }
}
