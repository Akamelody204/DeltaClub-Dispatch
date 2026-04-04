import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiException } from '../common/exceptions/api.exception';
import type { JwtPayload } from '../auth/jwt-payload';
import { User } from '../user/user.entity';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import type { AdminQueryOrdersDto } from '../admin/dto/admin-query-orders.dto';
import {
  getOrderStatusDisplayText,
  type OrderStatus,
} from './order-status';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async create(playerUserId: string, dto: CreateOrderDto) {
    if (dto.designatedCompanionUserId) {
      const u = await this.users.findOne({
        where: { id: dto.designatedCompanionUserId },
      });
      if (!u) {
        throw new ApiException(
          40001,
          '点名的陪玩用户不存在',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (u.role !== 'companion') {
        throw new ApiException(
          40001,
          '点名的用户必须是陪玩角色',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const skuSnapshot = {
      skuId: dto.skuId,
      gameRegion: dto.gameRegion,
      durationMinutes: dto.durationMinutes,
      displayPriceText: undefined,
    };

    const order = this.orders.create({
      playerUserId,
      companionUserId: null,
      skuId: dto.skuId,
      skuSnapshot,
      gameRegion: dto.gameRegion ?? null,
      durationMinutes: dto.durationMinutes ?? null,
      remark: dto.remark ?? null,
      designatedCompanionUserId: dto.designatedCompanionUserId ?? null,
      status: 'PENDING_GRAB',
    });
    await this.orders.save(order);
    return this.toDetail(order);
  }

  async listForPlayer(playerUserId: string, q: QueryOrdersDto) {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 20;
    const where: Record<string, unknown> = { playerUserId };
    if (q.status) {
      where.status = q.status;
    }
    const [rows, total] = await this.orders.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      items: rows.map((o) => this.toListItem(o)),
      total,
      page,
      pageSize,
    };
  }

  /** 陪玩大厅：待抢单（公共 + 点名给本人） */
  async listAvailableForCompanion(
    companionUserId: string,
    q: QueryOrdersDto,
  ) {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 20;
    const qb = this.orders
      .createQueryBuilder('o')
      .where('o.status = :st', { st: 'PENDING_GRAB' })
      .andWhere(
        '(o.designatedCompanionUserId IS NULL OR o.designatedCompanionUserId = :cid)',
        { cid: companionUserId },
      )
      .orderBy('o.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);
    const [rows, total] = await qb.getManyAndCount();
    return {
      items: rows.map((o) => this.toListItem(o)),
      total,
      page,
      pageSize,
    };
  }

  /** 陪玩：已接单 / 服务中 */
  async listOngoingForCompanion(companionUserId: string, q: QueryOrdersDto) {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 20;
    const qb = this.orders
      .createQueryBuilder('o')
      .where('o.companionUserId = :cid', { cid: companionUserId })
      .andWhere('o.status IN (:...sts)', {
        sts: ['ACCEPTED', 'IN_SERVICE'],
      })
      .orderBy('o.updatedAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);
    const [rows, total] = await qb.getManyAndCount();
    return {
      items: rows.map((o) => this.toListItem(o)),
      total,
      page,
      pageSize,
    };
  }

  async getDetail(orderId: string, user: JwtPayload) {
    const order = await this.orders.findOne({ where: { id: orderId } });
    if (!order) {
      throw new ApiException(40401, '订单不存在', HttpStatus.NOT_FOUND);
    }
    this.assertOrderAccess(order, user);
    return this.toDetail(order);
  }

  /** 管理端：全表只读，无当事人校验 */
  async listForAdmin(q: AdminQueryOrdersDto) {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 20;
    const qb = this.orders.createQueryBuilder('o');
    if (q.status) {
      qb.andWhere('o.status = :st', { st: q.status });
    }
    if (q.orderId) {
      qb.andWhere('o.id = :id', { id: q.orderId });
    }
    qb.orderBy('o.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);
    const [rows, total] = await qb.getManyAndCount();
    return {
      items: rows.map((o) => this.toListItem(o)),
      total,
      page,
      pageSize,
    };
  }

  async getDetailForAdmin(orderId: string) {
    const order = await this.orders.findOne({ where: { id: orderId } });
    if (!order) {
      throw new ApiException(40401, '订单不存在', HttpStatus.NOT_FOUND);
    }
    return this.toDetail(order);
  }

  private assertOrderAccess(order: Order, user: JwtPayload) {
    if (user.role === 'player') {
      if (order.playerUserId !== user.sub) {
        throw new ApiException(
          40302,
          '无权操作该订单',
          HttpStatus.FORBIDDEN,
        );
      }
      return;
    }
    if (user.role === 'companion') {
      const isAssigned = order.companionUserId === user.sub;
      const isDesignatedPending =
        order.status === 'PENDING_GRAB' &&
        order.designatedCompanionUserId === user.sub;
      if (isAssigned || isDesignatedPending) {
        return;
      }
      throw new ApiException(
        40302,
        '无权操作该订单',
        HttpStatus.FORBIDDEN,
      );
    }
    if (user.role === 'admin') {
      return;
    }
    throw new ApiException(
      40301,
      '无权限（角色不符）',
      HttpStatus.FORBIDDEN,
    );
  }

  private toListItem(o: Order) {
    const status = o.status as OrderStatus;
    return {
      id: o.id,
      status: o.status,
      statusText: getOrderStatusDisplayText(
        status,
        o.designatedCompanionUserId,
      ),
      createdAt: o.createdAt.toISOString(),
      designatedCompanionUserId: o.designatedCompanionUserId,
    };
  }

  private toDetail(o: Order) {
    const status = o.status as OrderStatus;
    return {
      id: o.id,
      status: o.status,
      statusText: getOrderStatusDisplayText(
        status,
        o.designatedCompanionUserId,
      ),
      createdAt: o.createdAt.toISOString(),
      designatedCompanionUserId: o.designatedCompanionUserId,
      skuSnapshot: o.skuSnapshot ?? { skuId: o.skuId },
      playerUserId: o.playerUserId,
      companionUserId: o.companionUserId,
      remark: o.remark,
      gameRegion: o.gameRegion,
      durationMinutes: o.durationMinutes,
      timeline: [
        {
          status: 'PENDING_GRAB',
          at: o.createdAt.toISOString(),
        },
      ],
    };
  }
}
