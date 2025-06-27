import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamChangeHistoryDto, UpdateTeamChangeHistoryDto } from './dto/team-change-history.dto';

@Injectable()
export class TeamChangeHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTeamChangeHistoryDto) {
    return this.prisma.teamChangeHistory.create({ data });
  }

  async findAll() {
    return this.prisma.teamChangeHistory.findMany();
  }

  async findOne(id: string) {
    const history = await this.prisma.teamChangeHistory.findUnique({ where: { id } });
    if (!history) {
      throw new NotFoundException(`TeamChangeHistory with ID ${id} not found`);
    }
    return history;
  }

  async update(id: string, data: UpdateTeamChangeHistoryDto) {
    await this.findOne(id);
    return this.prisma.teamChangeHistory.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.teamChangeHistory.delete({ where: { id } });
  }
}
