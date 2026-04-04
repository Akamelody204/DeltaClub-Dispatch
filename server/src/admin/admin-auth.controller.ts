import { Body, Controller, Post } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuth: AdminAuthService) {}

  @Post('login')
  async login(@Body() dto: AdminLoginDto) {
    const data = await this.adminAuth.login(dto);
    return { code: 0, message: 'ok', data };
  }
}
