import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryAreaDto, UpdateDeliveryAreaDto } from './dto/delivery-area.dto';

@Injectable()
export class DeliveryAreaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDeliveryAreaDto) {
    return this.prisma.deliveryArea.create({ data });
  }

  async findAll() {
    return this.prisma.deliveryArea.findMany();
  }

  async findOne(id: string) {
    const deliveryArea = await this.prisma.deliveryArea.findUnique({ where: { id } });
    if (!deliveryArea) {
      throw new NotFoundException(`DeliveryArea with ID ${id} not found`);
    }
    return deliveryArea;
  }

  async update(id: string, data: UpdateDeliveryAreaDto) {
    await this.findOne(id);
    return this.prisma.deliveryArea.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.deliveryArea.delete({ where: { id } });
  }
}
