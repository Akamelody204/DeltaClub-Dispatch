import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiException } from '../common/exceptions/api.exception';
import { HttpStatus } from '@nestjs/common';

export interface Code2SessionResult {
  openid: string;
  session_key: string;
  unionid?: string;
}

@Injectable()
export class WechatService {
  constructor(private readonly config: ConfigService) {}

  async code2Session(code: string): Promise<Code2SessionResult> {
    const useMock = this.config.get<string>('WECHAT_USE_MOCK') === 'true';
    if (useMock) {
      const suffix = code.replace(/\W/g, '').slice(0, 24) || 'dev';
      return {
        openid: `mock_${suffix}`,
        session_key: 'mock_session_key',
      };
    }

    const appid = this.config.get<string>('WECHAT_MINI_APPID');
    const secret = this.config.get<string>('WECHAT_MINI_SECRET');
    if (!appid || !secret) {
      throw new ApiException(
        50000,
        '服务端未配置 WECHAT_MINI_APPID / WECHAT_MINI_SECRET，或请设置 WECHAT_USE_MOCK=true 做本地联调',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const url = new URL('https://api.weixin.qq.com/sns/jscode2session');
    url.searchParams.set('appid', appid);
    url.searchParams.set('secret', secret);
    url.searchParams.set('js_code', code);
    url.searchParams.set('grant_type', 'authorization_code');

    const res = await fetch(url.toString());
    const data = (await res.json()) as {
      errcode?: number;
      errmsg?: string;
      openid?: string;
      session_key?: string;
      unionid?: string;
    };

    if (data.errcode != null && data.errcode !== 0) {
      throw new ApiException(
        40001,
        data.errmsg ?? `微信接口错误 errcode=${data.errcode}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!data.openid || !data.session_key) {
      throw new ApiException(
        40001,
        '微信登录返回缺少 openid',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      openid: data.openid,
      session_key: data.session_key,
      unionid: data.unionid,
    };
  }
}
