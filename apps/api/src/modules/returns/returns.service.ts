import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
  ReturnStatus,
  TransactionType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ApproveReturnDto,
  ApprovedReturnItemDto,
  CompleteReturnDto,
  CreateCustomerReturnDto,
  CreateReturnDto,
  CustomerReturnItemDto,
  RefundReturnDto,
  RejectReturnDto,
  ReturnQueryDto,
} from './dto';
import {
  createPaginatedResult,
  getPaginationParams,
  PaginatedResult,
} from '../../common/utils';

const productSelect = Prisma.validator<Prisma.ProductSelect>()({
  id: true,
  name: true,
  sku: true,
  images: true,
});

const variantWithProductInclude = Prisma.validator<Prisma.VariantInclude>()({
  product: { select: productSelect },
});

const returnInclude = Prisma.validator<Prisma.ReturnInclude>()({
  items: true,
  order: {
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
      items: {
        include: {
          variant: {
            include: variantWithProductInclude,
          },
        },
      },
      payments: true,
    },
  },
});

const orderForReturnInclude = Prisma.validator<Prisma.OrderInclude>()({
  customer: true,
  items: {
    include: {
      variant: {
        include: variantWithProductInclude,
      },
    },
  },
  returns: {
    where: {
      status: { not: ReturnStatus.REJECTED },
    },
    include: { items: true },
  },
});

const completedReturnOrderInclude = Prisma.validator<Prisma.OrderInclude>()({
  items: true,
  returns: {
    where: { status: ReturnStatus.COMPLETED },
    include: { items: true },
  },
});

type ReturnWithRelations = Prisma.ReturnGetPayload<{
  include: typeof returnInclude;
}>;

type OrderForReturn = Prisma.OrderGetPayload<{
  include: typeof orderForReturnInclude;
}>;

type VariantWithProduct = Prisma.VariantGetPayload<{
  include: typeof variantWithProductInclude;
}>;

type HydratedReturnItem = ReturnWithRelations['items'][number] & {
  variant: VariantWithProduct | null;
};

export type HydratedReturn = Omit<ReturnWithRelations, 'items'> & {
  items: HydratedReturnItem[];
};

type ReturnLineInput = {
  orderItemId?: string;
  variantId: string;
  quantity: number;
  reason?: string;
};

type ReturnLine = {
  variantId: string;
  quantity: number;
  reason?: string;
  refundAmount: number;
};

type DbClient = Prisma.TransactionClient | PrismaService;

type ReturnCompletionOptions = {
  updatePaymentStatus: boolean;
};

type OrderReturnSummary = {
  hasReturn: boolean;
  latestStatus: ReturnStatus | null;
  returnCount: number;
  totalReturnableQuantity: number;
  totalRequestedQuantity: number;
  totalCompletedQuantity: number;
  returnableAmount: number;
  returnableItems: Array<{
    orderItemId: string;
    variantId: string;
    orderedQuantity: number;
    requestedQuantity: number;
    completedQuantity: number;
    returnableQuantity: number;
    unitRefundAmount: number;
  }>;
  returns: Array<{
    id: string;
    status: ReturnStatus;
    reason: string;
    refundAmount: number;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{
      variantId: string;
      quantity: number;
      reason: string | null;
    }>;
  }>;
};

@Injectable()
export class ReturnsService {
  private readonly logger = new Logger(ReturnsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(
    query: ReturnQueryDto,
  ): Promise<PaginatedResult<HydratedReturn>> {
    const { page, limit, skip } = getPaginationParams(query);
    const where: Prisma.ReturnWhereInput = {};
    const orderWhere: Prisma.OrderWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) {
        where.createdAt.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.createdAt.lte = new Date(`${query.dateTo}T23:59:59.999Z`);
      }
    }

    if (query.source) {
      orderWhere.source = query.source;
    }

    if (query.orderNumber) {
      orderWhere.orderNumber = {
        contains: query.orderNumber,
        mode: 'insensitive',
      };
    }

    if (query.search) {
      orderWhere.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        {
          customer: {
            is: {
              firstName: { contains: query.search, mode: 'insensitive' },
            },
          },
        },
        {
          customer: {
            is: {
              lastName: { contains: query.search, mode: 'insensitive' },
            },
          },
        },
        {
          customer: {
            is: {
              phone: { contains: query.search, mode: 'insensitive' },
            },
          },
        },
        {
          customer: {
            is: {
              email: { contains: query.search, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    if (query.customerId) {
      orderWhere.customerId = query.customerId;
    }

    if (Object.keys(orderWhere).length > 0) {
      where.order = { is: orderWhere };
    }

    const [returns, total] = await Promise.all([
      this.prisma.return.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: returnInclude,
      }),
      this.prisma.return.count({ where }),
    ]);

    const hydrated = await this.hydrateReturns(returns);
    return createPaginatedResult(hydrated, total, page, limit);
  }

  async findOne(id: string): Promise<HydratedReturn> {
    const ret = await this.prisma.return.findUnique({
      where: { id },
      include: returnInclude,
    });

    if (!ret) {
      throw new NotFoundException('Return request not found');
    }

    return this.hydrateReturn(ret);
  }

  async create(
    createReturnDto: CreateReturnDto,
    userId?: string,
  ): Promise<HydratedReturn> {
    const order = await this.getOrderForReturn(createReturnDto.orderId);
    const lines = this.buildReturnLines(order, createReturnDto.items);

    if (lines.length === 0) {
      throw new BadRequestException('No returnable items found for this order');
    }

    const refundAmount = lines.reduce(
      (sum, item) => sum + item.refundAmount,
      0,
    );

    const ret = await this.prisma.return.create({
      data: {
        orderId: order.id,
        reason: createReturnDto.reason,
        refundAmount,
        status: ReturnStatus.PENDING,
        notes: this.appendSystemNote(
          createReturnDto.notes,
          `Created by ${userId || 'system'}`,
        ),
        items: {
          create: lines.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            reason: item.reason,
          })),
        },
      },
      include: returnInclude,
    });

    this.logger.log(`Return created: ${ret.id} for order ${order.orderNumber}`);
    return this.hydrateReturn(ret);
  }

  async createCustomerReturn(
    customerId: string,
    orderId: string,
    body: CreateCustomerReturnDto,
  ): Promise<HydratedReturn> {
    const order = await this.getOrderForReturn(orderId);

    if (order.customerId !== customerId) {
      throw new NotFoundException('Order not found');
    }

    return this.create({
      orderId: order.id,
      reason: body.reason || 'Customer return request',
      notes: body.notes,
      items: this.mapCustomerReturnItems(body.items),
    });
  }

  async getOrderReturnSummary(orderId: string): Promise<OrderReturnSummary> {
    const summaries = await this.getOrderReturnSummaries([orderId]);
    return summaries.get(orderId) || this.createEmptyReturnSummary();
  }

  async getOrderReturnSummaries(
    orderIds: string[],
  ): Promise<Map<string, OrderReturnSummary>> {
    const summaries = new Map<string, OrderReturnSummary>();
    const uniqueOrderIds = Array.from(new Set(orderIds.filter(Boolean)));

    if (uniqueOrderIds.length === 0) {
      return summaries;
    }

    const orders = await this.prisma.order.findMany({
      where: { id: { in: uniqueOrderIds } },
      include: orderForReturnInclude,
    });

    for (const order of orders) {
      summaries.set(order.id, this.buildOrderReturnSummary(order));
    }

    for (const orderId of uniqueOrderIds) {
      if (!summaries.has(orderId)) {
        summaries.set(orderId, this.createEmptyReturnSummary());
      }
    }

    return summaries;
  }

  async approve(
    id: string,
    approveReturnDto: ApproveReturnDto,
    userId: string,
  ): Promise<HydratedReturn> {
    const ret = await this.getReturnOrThrow(id);

    if (ret.status !== ReturnStatus.PENDING) {
      throw new BadRequestException('Only pending returns can be approved');
    }

    const approvedLines = approveReturnDto.approvedItems
      ? this.buildApprovedReturnLines(ret, approveReturnDto.approvedItems)
      : null;
    const refundAmount = approvedLines
      ? approvedLines.reduce((sum, item) => sum + item.refundAmount, 0)
      : Number(ret.refundAmount);
    const restockNote =
      approveReturnDto.restock === undefined
        ? ''
        : ` Restock requested: ${approveReturnDto.restock ? 'yes' : 'no'}.`;

    const updated = await this.prisma.return.update({
      where: { id },
      data: {
        status: ReturnStatus.APPROVED,
        refundAmount,
        notes: this.appendSystemNote(
          ret.notes,
          `Approved by ${userId}.${restockNote}${approveReturnDto.notes ? ` ${approveReturnDto.notes}` : ''}`,
        ),
        ...(approvedLines && {
          items: {
            deleteMany: {},
            create: approvedLines.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              reason: item.reason,
            })),
          },
        }),
      },
      include: returnInclude,
    });

    return this.hydrateReturn(updated);
  }

  async reject(
    id: string,
    rejectReturnDto: RejectReturnDto,
    userId: string,
  ): Promise<HydratedReturn> {
    const ret = await this.getReturnOrThrow(id);

    if (ret.status === ReturnStatus.COMPLETED) {
      throw new BadRequestException('Completed returns cannot be rejected');
    }

    const updated = await this.prisma.return.update({
      where: { id },
      data: {
        status: ReturnStatus.REJECTED,
        notes: this.appendSystemNote(
          ret.notes,
          `Rejected by ${userId}: ${rejectReturnDto.reason}`,
        ),
      },
      include: returnInclude,
    });

    return this.hydrateReturn(updated);
  }

  async refund(
    id: string,
    refundReturnDto: RefundReturnDto,
    userId: string,
  ): Promise<HydratedReturn> {
    const updatedId = await this.prisma.$transaction(async (tx) => {
      const ret = await this.getReturnOrThrow(id, tx);

      if (ret.status !== ReturnStatus.APPROVED) {
        throw new BadRequestException('Only approved returns can be refunded');
      }

      const amount = Number(ret.refundAmount);
      if (amount <= 0) {
        throw new BadRequestException('Refund amount is invalid');
      }

      await tx.transaction.create({
        data: {
          type: TransactionType.EXPENSE,
          category: 'RETURN_REFUND',
          amount,
          description: refundReturnDto.notes
            ? `Refund for order ${ret.order.orderNumber}: ${refundReturnDto.notes}`
            : `Refund for order ${ret.order.orderNumber}`,
          reference: refundReturnDto.reference || ret.id,
          paymentMethod: refundReturnDto.method,
          orderId: ret.orderId,
          userId,
        },
      });

      const updated = await this.completeReturnInTransaction(
        ret,
        {
          restock: refundReturnDto.restock ?? true,
          notes: refundReturnDto.notes || 'Refund completed',
        },
        userId,
        tx,
        { updatePaymentStatus: true },
      );

      return updated.id;
    });

    return this.findOne(updatedId);
  }

  async complete(
    id: string,
    completeReturnDto: CompleteReturnDto,
    userId: string,
  ): Promise<HydratedReturn> {
    const updatedId = await this.prisma.$transaction(async (tx) => {
      const ret = await this.getReturnOrThrow(id, tx);
      const updated = await this.completeReturnInTransaction(
        ret,
        completeReturnDto,
        userId,
        tx,
        { updatePaymentStatus: false },
      );

      return updated.id;
    });

    return this.findOne(updatedId);
  }

  private async completeReturnInTransaction(
    ret: ReturnWithRelations,
    completeReturnDto: CompleteReturnDto,
    userId: string,
    tx: Prisma.TransactionClient,
    options: ReturnCompletionOptions,
  ): Promise<ReturnWithRelations> {
    if (ret.status === ReturnStatus.COMPLETED) {
      throw new BadRequestException('Return is already completed');
    }

    if (ret.status === ReturnStatus.REJECTED) {
      throw new BadRequestException('Rejected returns cannot be completed');
    }

    if (ret.status !== ReturnStatus.APPROVED) {
      throw new BadRequestException('Only approved returns can be completed');
    }

    const restock = completeReturnDto.restock ?? true;

    if (restock) {
      for (const item of ret.items) {
        await tx.variant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    const updated = await tx.return.update({
      where: { id: ret.id },
      data: {
        status: ReturnStatus.COMPLETED,
        notes: this.appendSystemNote(
          ret.notes,
          `Completed by ${userId}${completeReturnDto.notes ? `: ${completeReturnDto.notes}` : ''}`,
        ),
      },
      include: returnInclude,
    });

    await this.updateOrderAfterCompletedReturn(ret.orderId, tx, options);

    return updated;
  }

  private async getReturnOrThrow(
    id: string,
    client: DbClient = this.prisma,
  ): Promise<ReturnWithRelations> {
    const ret = await client.return.findUnique({
      where: { id },
      include: returnInclude,
    });

    if (!ret) {
      throw new NotFoundException('Return request not found');
    }

    return ret;
  }

  private async getOrderForReturn(orderId: string): Promise<OrderForReturn> {
    const order = await this.prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      include: orderForReturnInclude,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cancelled orders cannot be returned');
    }

    if (
      order.status !== OrderStatus.COMPLETED &&
      order.status !== OrderStatus.DELIVERED
    ) {
      throw new BadRequestException(
        'Only completed or delivered orders can be returned',
      );
    }

    return order;
  }

  private buildReturnLines(
    order: OrderForReturn,
    requestedItems: ReturnLineInput[],
  ): ReturnLine[] {
    const returnedByVariant = new Map<string, number>();
    for (const existingReturn of order.returns) {
      for (const item of existingReturn.items) {
        returnedByVariant.set(
          item.variantId,
          (returnedByVariant.get(item.variantId) || 0) + item.quantity,
        );
      }
    }

    const requestedByVariant = new Map<string, number>();
    const sourceItems: ReturnLineInput[] = requestedItems;

    return sourceItems
      .map((requested): ReturnLine | null => {
        const orderItem = requested.orderItemId
          ? order.items.find((item) => item.id === requested.orderItemId)
          : order.items.find((item) => item.variantId === requested.variantId);

        if (!orderItem) {
          throw new BadRequestException(
            `Order item not found for variant ${requested.variantId}`,
          );
        }

        if (orderItem.variantId !== requested.variantId) {
          throw new BadRequestException('Return item variant mismatch');
        }

        if (requested.orderItemId && requested.quantity > orderItem.quantity) {
          throw new BadRequestException(
            `Return quantity exceeds ordered quantity for item ${orderItem.id}`,
          );
        }

        const alreadyReturned = returnedByVariant.get(orderItem.variantId) || 0;
        const alreadyRequested =
          requestedByVariant.get(orderItem.variantId) || 0;
        const orderedQuantityForVariant = order.items
          .filter((item) => item.variantId === orderItem.variantId)
          .reduce((sum, item) => sum + item.quantity, 0);
        const available =
          orderedQuantityForVariant - alreadyReturned - alreadyRequested;

        if (requested.quantity <= 0) {
          return null;
        }

        if (requested.quantity > available) {
          throw new BadRequestException(
            `Return quantity exceeds available quantity for ${orderItem.variantId}`,
          );
        }

        requestedByVariant.set(
          orderItem.variantId,
          alreadyRequested + requested.quantity,
        );

        const unitRefund = this.getUnitRefundForVariant(
          order.items,
          orderItem.variantId,
          requested.orderItemId,
        );

        return {
          variantId: orderItem.variantId,
          quantity: requested.quantity,
          reason: requested.reason,
          refundAmount: Number((unitRefund * requested.quantity).toFixed(2)),
        };
      })
      .filter((line): line is ReturnLine => line !== null);
  }

  private buildApprovedReturnLines(
    ret: ReturnWithRelations,
    approvedItems: ApprovedReturnItemDto[],
  ): ReturnLine[] {
    const requestedByVariant = new Map<string, number>();
    for (const item of ret.items) {
      requestedByVariant.set(
        item.variantId,
        (requestedByVariant.get(item.variantId) || 0) + item.quantity,
      );
    }

    const approvedByVariant = new Map<string, number>();

    return approvedItems.map((approved) => {
      const orderItem = approved.orderItemId
        ? ret.order.items.find((item) => item.id === approved.orderItemId)
        : ret.order.items.find((item) => item.variantId === approved.variantId);

      if (!orderItem) {
        throw new BadRequestException(
          `Order item not found for variant ${approved.variantId}`,
        );
      }

      if (orderItem.variantId !== approved.variantId) {
        throw new BadRequestException('Approved return item variant mismatch');
      }

      if (approved.orderItemId && approved.quantity > orderItem.quantity) {
        throw new BadRequestException(
          `Approved quantity exceeds ordered quantity for item ${orderItem.id}`,
        );
      }

      const requestedQuantity = requestedByVariant.get(approved.variantId) || 0;
      const alreadyApproved = approvedByVariant.get(approved.variantId) || 0;

      if (approved.quantity > requestedQuantity - alreadyApproved) {
        throw new BadRequestException(
          `Approved quantity exceeds requested quantity for ${approved.variantId}`,
        );
      }

      approvedByVariant.set(
        approved.variantId,
        alreadyApproved + approved.quantity,
      );

      const unitRefund = this.getUnitRefundForVariant(
        ret.order.items,
        approved.variantId,
        approved.orderItemId,
      );

      return {
        variantId: approved.variantId,
        quantity: approved.quantity,
        reason: approved.reason,
        refundAmount: Number((unitRefund * approved.quantity).toFixed(2)),
      };
    });
  }

  private buildOrderReturnSummary(order: OrderForReturn): OrderReturnSummary {
    const requestedByVariant = new Map<string, number>();
    const completedByVariant = new Map<string, number>();

    for (const ret of order.returns) {
      for (const item of ret.items) {
        requestedByVariant.set(
          item.variantId,
          (requestedByVariant.get(item.variantId) || 0) + item.quantity,
        );

        if (ret.status === ReturnStatus.COMPLETED) {
          completedByVariant.set(
            item.variantId,
            (completedByVariant.get(item.variantId) || 0) + item.quantity,
          );
        }
      }
    }

    const returnableItems = order.items.map((item) => {
      const requestedQuantity = requestedByVariant.get(item.variantId) || 0;
      const completedQuantity = completedByVariant.get(item.variantId) || 0;
      const returnableQuantity = Math.max(0, item.quantity - requestedQuantity);
      const unitRefundAmount =
        item.quantity > 0 ? Number(item.total) / item.quantity : 0;

      return {
        orderItemId: item.id,
        variantId: item.variantId,
        orderedQuantity: item.quantity,
        requestedQuantity,
        completedQuantity,
        returnableQuantity,
        unitRefundAmount: Number(unitRefundAmount.toFixed(2)),
      };
    });

    const latestReturn = [...order.returns].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )[0];

    return {
      hasReturn: order.returns.length > 0,
      latestStatus: latestReturn?.status || null,
      returnCount: order.returns.length,
      totalReturnableQuantity: returnableItems.reduce(
        (sum, item) => sum + item.returnableQuantity,
        0,
      ),
      totalRequestedQuantity: returnableItems.reduce(
        (sum, item) => sum + item.requestedQuantity,
        0,
      ),
      totalCompletedQuantity: returnableItems.reduce(
        (sum, item) => sum + item.completedQuantity,
        0,
      ),
      returnableAmount: Number(
        returnableItems
          .reduce(
            (sum, item) =>
              sum + item.returnableQuantity * item.unitRefundAmount,
            0,
          )
          .toFixed(2),
      ),
      returnableItems,
      returns: order.returns
        .slice()
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((ret) => ({
          id: ret.id,
          status: ret.status,
          reason: ret.reason,
          refundAmount: Number(ret.refundAmount),
          createdAt: ret.createdAt,
          updatedAt: ret.updatedAt,
          items: ret.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            reason: item.reason,
          })),
        })),
    };
  }

  private createEmptyReturnSummary(): OrderReturnSummary {
    return {
      hasReturn: false,
      latestStatus: null,
      returnCount: 0,
      totalReturnableQuantity: 0,
      totalRequestedQuantity: 0,
      totalCompletedQuantity: 0,
      returnableAmount: 0,
      returnableItems: [],
      returns: [],
    };
  }

  private getUnitRefundForVariant(
    orderItems: ReturnWithRelations['order']['items'],
    variantId: string,
    orderItemId?: string,
  ): number {
    if (orderItemId) {
      const orderItem = orderItems.find((item) => item.id === orderItemId);
      return orderItem && orderItem.quantity > 0
        ? Number(orderItem.total) / orderItem.quantity
        : 0;
    }

    const matchingItems = orderItems.filter(
      (item) => item.variantId === variantId,
    );
    const quantity = matchingItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const total = matchingItems.reduce(
      (sum, item) => sum + Number(item.total),
      0,
    );

    return quantity > 0 ? total / quantity : 0;
  }

  private mapCustomerReturnItems(
    items: CustomerReturnItemDto[],
  ): ReturnLineInput[] {
    return items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      reason: item.reason,
    }));
  }

  private async updateOrderAfterCompletedReturn(
    orderId: string,
    client: DbClient = this.prisma,
    options: ReturnCompletionOptions = { updatePaymentStatus: false },
  ): Promise<void> {
    const order = await client.order.findUnique({
      where: { id: orderId },
      include: completedReturnOrderInclude,
    });

    if (!order) {
      return;
    }

    const returnedByVariant = new Map<string, number>();
    for (const ret of order.returns) {
      for (const item of ret.items) {
        returnedByVariant.set(
          item.variantId,
          (returnedByVariant.get(item.variantId) || 0) + item.quantity,
        );
      }
    }

    const statusModel = this.calculateCompletedReturnStatus(order.items, {
      returnedByVariant,
    });

    await client.order.update({
      where: { id: orderId },
      data: {
        ...(statusModel.orderStatus && { status: statusModel.orderStatus }),
        ...(options.updatePaymentStatus && {
          paymentStatus: statusModel.paymentStatus,
        }),
      },
    });

    if (options.updatePaymentStatus) {
      await client.payment.updateMany({
        where: {
          orderId,
          status: { not: PaymentStatus.FAILED },
        },
        data: { status: statusModel.paymentStatus },
      });
    }
  }

  private calculateCompletedReturnStatus(
    orderItems: Array<{ variantId: string; quantity: number }>,
    completedReturns: { returnedByVariant: Map<string, number> },
  ): { orderStatus?: OrderStatus; paymentStatus: PaymentStatus } {
    const orderedByVariant = new Map<string, number>();
    for (const item of orderItems) {
      orderedByVariant.set(
        item.variantId,
        (orderedByVariant.get(item.variantId) || 0) + item.quantity,
      );
    }

    const fullyReturned = Array.from(orderedByVariant.entries()).every(
      ([variantId, quantity]) =>
        (completedReturns.returnedByVariant.get(variantId) || 0) >= quantity,
    );

    return {
      orderStatus: fullyReturned ? OrderStatus.RETURNED : undefined,
      paymentStatus: fullyReturned
        ? PaymentStatus.REFUNDED
        : PaymentStatus.PARTIAL,
    };
  }

  private async hydrateReturns(
    returns: ReturnWithRelations[],
  ): Promise<HydratedReturn[]> {
    return Promise.all(returns.map((ret) => this.hydrateReturn(ret)));
  }

  private async hydrateReturn(
    ret: ReturnWithRelations,
  ): Promise<HydratedReturn> {
    const variantIds = ret.items.map((item) => item.variantId);
    const variants = await this.prisma.variant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: {
          select: productSelect,
        },
      },
    });

    const variantMap = new Map(
      variants.map((variant) => [variant.id, variant]),
    );

    return {
      ...ret,
      items: ret.items.map((item) => ({
        ...item,
        variant: variantMap.get(item.variantId) || null,
      })),
    };
  }

  private appendSystemNote(
    current: string | null | undefined,
    note: string,
  ): string {
    const stamp = new Date().toISOString();
    return [current, `[${stamp}] ${note}`].filter(Boolean).join('\n');
  }
}
