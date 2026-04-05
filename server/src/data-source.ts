import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { TYPEORM_ENTITIES } from './database/typeorm-app-options';
import { Baseline1744000000000 } from './migrations/1744000000000-BaselineSchema';

/**
 * TypeORM CLI 专用（`migration:run` / `migration:revert` / `migration:generate`）。
 * 从项目根目录执行脚本，加载根目录 `.env`。
 */
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? 'root',
  database: process.env.DB_NAME ?? 'clubxcx',
  entities: [...TYPEORM_ENTITIES],
  /** 迁移与 `synchronize` 互斥；CLI 与 B1-6 均要求迁移路径下不改表 */
  synchronize: false,
  logging: process.env.DB_LOG === 'true',
  migrations: [Baseline1744000000000],
  migrationsTableName: 'typeorm_migrations',
});
