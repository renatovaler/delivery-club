import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketMessageDto, UpdateTicketMessageDto } from './dto/ticket-message.dto';

@Injectable()
export class TicketMessageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTicketMessageDto) {
    return this.prisma.ticketMessage.create({ data });
  }

  async findAll() {
    return this.prisma.ticketMessage.findMany();
  }

  async findOne(id: string) {
    const message = await this.prisma.ticketMessage.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException(`TicketMessage with ID ${id} not found`);
    }
    return message;
  }

  async update(id: string, data: UpdateTicketMessageDto) {
    await this.findOne(id);
    return this.prisma.ticketMessage.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.ticketMessage.delete({ where: { id } });
  }
}
