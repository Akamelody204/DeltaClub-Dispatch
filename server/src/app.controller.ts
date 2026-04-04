import { Controller, Get } from '@nestjs/common';

/** 与 `/health` 区分；业务 API 在 `/api/v1/*` */
@Controller('meta')
export class AppController {
  @Get()
  meta() {
    return {
      code: 0,
      message: 'ok',
      data: { service: 'clubxcx-server', version: '0.1.0' },
    };
  }
}
