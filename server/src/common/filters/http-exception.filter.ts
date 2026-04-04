import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: Record<string, unknown>;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null && 'code' in res) {
        body = res as Record<string, unknown>;
        response.status(status).json(body);
        return;
      }

      let message = 'Error';
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null && 'message' in res) {
        const m = (res as { message: string | string[] }).message;
        message = Array.isArray(m) ? m.join(', ') : String(m);
      } else {
        message = exception.message;
      }

      body = {
        code: status,
        message,
        data: null,
      };
    } else if (exception instanceof Error) {
      body = {
        code: 50000,
        message: exception.message,
        data: null,
      };
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    } else {
      body = {
        code: 50000,
        message: 'Internal Server Error',
        data: null,
      };
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    response.status(status).json(body);
  }
}
