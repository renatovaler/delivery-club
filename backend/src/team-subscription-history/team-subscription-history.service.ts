import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamSubscriptionHistoryDto, UpdateTeamSubscriptionHistoryDto } from './dto/team-subscription-history.dto';

@Injectable()
export class TeamSubscriptionHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTeamSubscriptionHistoryDto) {
    return this.prisma.teamSubscriptionHistory.create({ data });
  }

  async findAll() {
    return this.prisma.teamSubscriptionHistory.findMany();
  }

  async findOne(id: string) {
    const history = await this.prisma.teamSubscriptionHistory.findUnique({ where: { id } });
    if (!history) {
      throw new NotFoundException(`TeamSubscriptionHistory with ID ${id} not found`);
    }
    return history;
  }

  async update(id: string, data: UpdateTeamSubscriptionHistoryDto) {
    await this.findOne(id);
    return this.prisma.teamSubscriptionHistory.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.teamSubscriptionHistory.delete({ where: { id } });
  }
}
