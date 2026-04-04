import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { OrderStatus } from './order-status';

export interface SkuSnapshot {
  skuId: string;
  gameRegion?: string;
  durationMinutes?: number;
  /** 展示用，一期可写死或来自种子 SKU */
  displayPriceText?: string;
}

@Entity('orders')
@Index('idx_orders_player_created', ['playerUserId', 'createdAt'])
@Index('idx_orders_status_created', ['status', 'createdAt'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  playerUserId!: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  companionUserId!: string | null;

  @Column({ type: 'varchar', length: 64 })
  skuId!: string;

  @Column({ type: 'json', nullable: true })
  skuSnapshot!: SkuSnapshot | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  gameRegion!: string | null;

  @Column({ type: 'int', nullable: true })
  durationMinutes!: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  remark!: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  designatedCompanionUserId!: string | null;

  @Column({ type: 'varchar', length: 32 })
  status!: OrderStatus;

  @CreateDateColumn({ type: 'datetime', precision: 3 })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 3 })
  updatedAt!: Date;
}
