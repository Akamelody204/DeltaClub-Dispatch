import { HttpException, HttpStatus } from '@nestjs/common';

/** 业务码与 HTTP 状态分离（对齐 `plan/product/dev/接口表-v0.md` §7） */
export class ApiException extends HttpException {
  constructor(
    businessCode: number,
    message: string,
    httpStatus: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ code: businessCode, message, data: null }, httpStatus);
  }
}
