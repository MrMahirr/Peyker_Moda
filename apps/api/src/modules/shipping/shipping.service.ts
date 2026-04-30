import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CarrierCode, ShipmentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CargoService } from '../cargo/cargo.service';
import {
  CreateCarrierDto,
  CreateShipmentDto,
  CreateShippingRateDto,
  ShipmentQueryDto,
  ShippingRateQueryDto,
  ShippingReportQueryDto,
  UpdateCarrierDto,
  UpdateShipmentStatusDto,
  CarrierQueryDto,
} from './dto';
import {
  toCarrierResponse,
  toShipmentResponse,
  toShippingRateResponse,
} from './shipping.mapper';
import {
  ACTIVE_DELIVERY_STATUSES,
  getTrackingLocation,
  mapCargoStatusToShipmentStatus,
} from './shipping.constants';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cargoService: CargoService,
  ) {}

  async getCarriers(query: CarrierQueryDto) {
    const where: { isActive?: boolean; code?: CarrierCode } = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.code) {
      where.code = query.code;
    }

    const carriers = await this.prisma.carrier.findMany({
      where,
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });

    return carriers.map(toCarrierResponse);
  }

  async createCarrier(dto: CreateCarrierDto) {
    const existingCarrier = await this.prisma.carrier.findUnique({
      where: { code: dto.code },
    });

    if (existingCarrier) {
      throw new ConflictException('Bu kargo koduna sahip firma zaten mevcut');
    }

    const carrier = await this.prisma.carrier.create({
      data: {
        ...dto,
        isActive: dto.isActive ?? true,
      },
    });

    this.logger.log(`Carrier created: ${carrier.name}`);
    return toCarrierResponse(carrier);
  }

  async updateCarrier(id: string, dto: UpdateCarrierDto) {
    await this.ensureCarrierExists(id);

    if (dto.code) {
      const existingCarrier = await this.prisma.carrier.findFirst({
        where: {
          code: dto.code,
          NOT: { id },
        },
      });

      if (existingCarrier) {
        throw new ConflictException('Bu kargo koduna sahip firma zaten mevcut');
      }
    }

    const carrier = await this.prisma.carrier.update({
      where: { id },
      data: dto,
    });

    this.logger.log(`Carrier updated: ${carrier.name}`);
    return toCarrierResponse(carrier);
  }

  async deleteCarrier(id: string) {
    await this.ensureCarrierExists(id);

    const [shipmentCount, rateCount] = await Promise.all([
      this.prisma.shipment.count({ where: { carrierId: id } }),
      this.prisma.shippingRate.count({ where: { carrierId: id } }),
    ]);

    if (shipmentCount > 0 || rateCount > 0) {
      throw new BadRequestException(
        'Bu kargo firmasi kullaniliyor. Once bagli gonderi ve tarifeleri temizleyin.',
      );
    }

    await this.prisma.carrier.delete({
      where: { id },
    });

    return { message: 'Kargo firmasi silindi' };
  }

  async getShipments(query: ShipmentQueryDto) {
    const where: { status?: ShipmentStatus } = {};

    if (query.status) {
      where.status = query.status;
    }

    const shipments = await this.prisma.shipment.findMany({
      where,
      include: {
        order: {
          select: { orderNumber: true },
        },
        carrier: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return shipments.map(toShipmentResponse);
  }

  async createShipment(dto: CreateShipmentDto) {
    const [order, carrier] = await Promise.all([
      this.prisma.order.findUnique({
        where: { id: dto.orderId },
        include: {
          items: true,
        },
      }),
      this.prisma.carrier.findUnique({
        where: { id: dto.carrierId },
      }),
    ]);

    if (!order) {
      throw new NotFoundException('Siparis bulunamadi');
    }

    if (!carrier) {
      throw new NotFoundException('Kargo firmasi bulunamadi');
    }

    const providerShipment = await this.cargoService.createShipment({
      orderId: order.id,
      customerName: dto.recipientName,
      customerAddress: dto.recipientAddress,
      customerPhone: dto.recipientPhone,
      items: order.items,
    });

    const shipment = await this.prisma.shipment.create({
      data: {
        orderId: order.id,
        carrierId: carrier.id,
        trackingNumber: providerShipment.trackingCode,
        status: dto.status ?? ShipmentStatus.PREPARING,
        recipientName: dto.recipientName,
        recipientPhone: dto.recipientPhone,
        recipientAddress: dto.recipientAddress,
        weight: dto.weight,
        desi: dto.desi,
        shippingCost: dto.shippingCost ?? 0,
        estimatedDelivery: dto.estimatedDelivery
          ? new Date(dto.estimatedDelivery)
          : undefined,
      },
      include: {
        order: {
          select: { orderNumber: true },
        },
        carrier: {
          select: { name: true },
        },
      },
    });

    this.logger.log(
      `Shipment created: ${shipment.trackingNumber} for order ${order.orderNumber}`,
    );

    return toShipmentResponse(shipment);
  }

  async updateShipmentStatus(id: string, dto: UpdateShipmentStatusDto) {
    await this.ensureShipmentExists(id);

    const shipment = await this.prisma.shipment.update({
      where: { id },
      data: {
        status: dto.status,
        deliveredAt:
          dto.status === ShipmentStatus.DELIVERED ? new Date() : null,
      },
      include: {
        order: {
          select: { orderNumber: true },
        },
        carrier: {
          select: { name: true },
        },
      },
    });

    return toShipmentResponse(shipment);
  }

  async trackShipment(id: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
    });

    if (!shipment) {
      throw new NotFoundException('Gonderi bulunamadi');
    }

    const providerStatus = await this.cargoService.checkStatus(
      shipment.trackingNumber,
    );
    const mappedStatus = mapCargoStatusToShipmentStatus(providerStatus.status);

    if (shipment.status !== mappedStatus) {
      await this.prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          status: mappedStatus,
          deliveredAt:
            mappedStatus === ShipmentStatus.DELIVERED
              ? providerStatus.updatedAt
              : shipment.deliveredAt,
        },
      });
    }

    return {
      events: [
        {
          date: shipment.createdAt.toISOString(),
          status: 'Gonderi olusturuldu',
          location: 'Peyker Moda',
        },
        {
          date: providerStatus.updatedAt.toISOString(),
          status: providerStatus.description,
          location: getTrackingLocation(providerStatus.status),
        },
      ],
    };
  }

  async getRates(query: ShippingRateQueryDto) {
    const where: { carrierId?: string; isActive?: boolean } = {};

    if (query.carrierId) {
      where.carrierId = query.carrierId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const rates = await this.prisma.shippingRate.findMany({
      where,
      include: {
        carrier: {
          select: { name: true },
        },
      },
      orderBy: [{ carrier: { name: 'asc' } }, { minWeight: 'asc' }],
    });

    return rates.map(toShippingRateResponse);
  }

  async createRate(dto: CreateShippingRateDto) {
    await this.ensureCarrierExists(dto.carrierId);
    this.validateRateRange(dto.minWeight, dto.maxWeight);

    const overlappingRate = await this.prisma.shippingRate.findFirst({
      where: {
        carrierId: dto.carrierId,
        zone: dto.zone,
        OR: [
          {
            minWeight: { lte: dto.minWeight },
            maxWeight: { gte: dto.minWeight },
          },
          {
            minWeight: { lte: dto.maxWeight },
            maxWeight: { gte: dto.maxWeight },
          },
          {
            minWeight: { gte: dto.minWeight },
            maxWeight: { lte: dto.maxWeight },
          },
        ],
      },
    });

    if (overlappingRate) {
      throw new ConflictException(
        'Bu firma ve bolge icin agirlik araligi cakisan bir tarife zaten mevcut',
      );
    }

    const rate = await this.prisma.shippingRate.create({
      data: {
        ...dto,
        isActive: dto.isActive ?? true,
      },
      include: {
        carrier: {
          select: { name: true },
        },
      },
    });

    return toShippingRateResponse(rate);
  }

  async getDeliveryReport(query: ShippingReportQueryDto) {
    const startDate = new Date(query.startDate);
    const endDate = new Date(`${query.endDate}T23:59:59.999Z`);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('Gecersiz tarih araligi');
    }

    const shipments = await this.prisma.shipment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        status: true,
        createdAt: true,
        deliveredAt: true,
      },
    });

    const delivered = shipments.filter(
      (shipment) => shipment.status === ShipmentStatus.DELIVERED,
    );
    const returned = shipments.filter(
      (shipment) => shipment.status === ShipmentStatus.RETURNED,
    );
    const inTransit = shipments.filter((shipment) =>
      ACTIVE_DELIVERY_STATUSES.includes(shipment.status),
    );

    const deliveredWithDuration = delivered.filter(
      (shipment) => shipment.deliveredAt !== null,
    );
    const avgDeliveryDays =
      deliveredWithDuration.length > 0
        ? deliveredWithDuration.reduce((total, shipment) => {
            const deliveredAt = shipment.deliveredAt as Date;
            const diffMs = deliveredAt.getTime() - shipment.createdAt.getTime();
            return total + diffMs / (1000 * 60 * 60 * 24);
          }, 0) / deliveredWithDuration.length
        : 0;

    return {
      delivered: delivered.length,
      returned: returned.length,
      inTransit: inTransit.length,
      avgDeliveryDays: Number(avgDeliveryDays.toFixed(2)),
    };
  }

  private async ensureCarrierExists(id: string) {
    const carrier = await this.prisma.carrier.findUnique({
      where: { id },
    });

    if (!carrier) {
      throw new NotFoundException('Kargo firmasi bulunamadi');
    }

    return carrier;
  }

  private async ensureShipmentExists(id: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
    });

    if (!shipment) {
      throw new NotFoundException('Gonderi bulunamadi');
    }

    return shipment;
  }

  private validateRateRange(minWeight: number, maxWeight: number) {
    if (maxWeight < minWeight) {
      throw new BadRequestException(
        'Maksimum agirlik minimum agirliktan kucuk olamaz',
      );
    }
  }
}
