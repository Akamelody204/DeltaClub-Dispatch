import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Order } from '../order/order.entity';

/** 与 `data-source.ts`、迁移共用，避免实体列表漂移 */
export const TYPEORM_ENTITIES = [User, Order] as const;

/**
 * Nest 运行时 TypeORM 配置（含 `DB_SYNC`）。
 * 迁移 CLI 使用 `data-source.ts`，其中 **synchronize 恒为 false**。
 */
export function createTypeOrmModuleOptions(
  config: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: config.get<string>('DB_HOST', '127.0.0.1'),
    port: parseInt(String(config.get('DB_PORT', '3306')), 10),
    username: config.get<string>('DB_USER', 'root'),
    password: config.get<string>('DB_PASSWORD', 'root'),
    database: config.get<string>('DB_NAME', 'clubxcx'),
    entities: [...TYPEORM_ENTITIES],
    synchronize: config.get<string>('DB_SYNC', 'true') === 'true',
    logging: config.get<string>('DB_LOG') === 'true',
  };
}
