import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 首版基线：与当前 `User`、`Order` 实体及 MySQL 8 + InnoDB 一致。
 * 新建库请 `migration:run` 应用本迁移；曾用 `DB_SYNC=true` 的库须按 B1-6 对齐后再关 sync。
 */
export class Baseline1744000000000 implements MigrationInterface {
  name = 'Baseline1744000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users\` (
        \`id\` varchar(36) NOT NULL,
        \`openid\` varchar(64) NOT NULL,
        \`role\` varchar(32) NOT NULL,
        \`nickname\` varchar(128) NULL,
        \`avatarUrl\` varchar(512) NULL,
        \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        UNIQUE INDEX \`IDX_users_openid\` (\`openid\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    );

    await queryRunner.query(
      `CREATE TABLE \`orders\` (
        \`id\` varchar(36) NOT NULL,
        \`playerUserId\` varchar(36) NOT NULL,
        \`companionUserId\` varchar(36) NULL,
        \`skuId\` varchar(64) NOT NULL,
        \`skuSnapshot\` json NULL,
        \`gameRegion\` varchar(128) NULL,
        \`durationMinutes\` int NULL,
        \`remark\` varchar(500) NULL,
        \`designatedCompanionUserId\` varchar(36) NULL,
        \`status\` varchar(32) NOT NULL,
        \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        INDEX \`idx_orders_player_created\` (\`playerUserId\`, \`createdAt\`),
        INDEX \`idx_orders_status_created\` (\`status\`, \`createdAt\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`orders\``);
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
