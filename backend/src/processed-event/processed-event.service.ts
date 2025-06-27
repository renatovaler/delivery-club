import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessedEventDto, UpdateProcessedEventDto } from './dto/processed-event.dto';

@Injectable()
export class ProcessedEventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProcessedEventDto) {
    return this.prisma.processedEvent.create({ data });
  }

  async findAll() {
    return this.prisma.processedEvent.findMany();
  }

  async findOne(id: string) {
    const event = await this.prisma.processedEvent.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException(`ProcessedEvent with ID ${id} not found`);
    }
    return event;
  }

  async update(id: string, data: UpdateProcessedEventDto) {
    await this.findOne(id);
    return this.prisma.processedEvent.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.processedEvent.delete({ where: { id } });
  }
}
