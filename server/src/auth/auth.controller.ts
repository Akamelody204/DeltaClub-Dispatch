import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { JwtPayload } from './jwt-payload';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('wechat/login')
  async wechatLogin(@Body() dto: WechatLoginDto) {
    const data = await this.auth.loginWithWechatCode(dto.code);
    return { code: 0, message: 'ok', data };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Req() req: { user: JwtPayload }) {
    void req.user;
    return { code: 0, message: 'ok', data: null };
  }
}
