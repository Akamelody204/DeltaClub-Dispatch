import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import type { JwtPayload } from './jwt-payload';

/**
 * 鉴权样例：B1-2
 * - `GET /me`：仅校验登录
 * - `GET /roles-demo/player`：仅 `player` 可访问（陪玩/管理拿 40301）
 */
@Controller()
export class MeController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtPayload) {
    return {
      code: 0,
      message: 'ok',
      data: {
        id: user.sub,
        openid: user.openid,
        role: user.role,
      },
    };
  }

  @Get('roles-demo/player')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('player')
  rolesDemoPlayer() {
    return {
      code: 0,
      message: 'ok',
      data: { ok: true, hint: '当前为 player 角色' },
    };
  }
}
