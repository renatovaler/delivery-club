import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionItemDto, UpdateSubscriptionItemDto } from './dto/subscription-item.dto';

@Injectable()
export class SubscriptionItemService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSubscriptionItemDto) {
    return this.prisma.subscriptionItem.create({ data });
  }

  async findAll() {
    return this.prisma.subscriptionItem.findMany();
  }

  async findOne(id: string) {
    const item = await this.prisma.subscriptionItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`SubscriptionItem with ID ${id} not found`);
    }
    return item;
  }

  async update(id: string, data: UpdateSubscriptionItemDto) {
    await this.findOne(id);
    return this.prisma.subscriptionItem.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.subscriptionItem.delete({ where: { id } });
  }
}
