import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupportTicketDto, UpdateSupportTicketDto } from './dto/support-ticket.dto';

@Injectable()
export class SupportTicketService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSupportTicketDto) {
    return this.prisma.supportTicket.create({ data });
  }

  async findAll() {
    return this.prisma.supportTicket.findMany();
  }

  async findOne(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`SupportTicket with ID ${id} not found`);
    }
    return ticket;
  }

  async update(id: string, data: UpdateSupportTicketDto) {
    await this.findOne(id);
    return this.prisma.supportTicket.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.supportTicket.delete({ where: { id } });
  }
}
