import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from './dto/team-member.dto';

@Injectable()
export class TeamMemberService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTeamMemberDto) {
    return this.prisma.teamMember.create({ data });
  }

  async findAll() {
    return this.prisma.teamMember.findMany();
  }

  async findOne(id: string) {
    const member = await this.prisma.teamMember.findUnique({ where: { id } });
    if (!member) {
      throw new NotFoundException(`TeamMember with ID ${id} not found`);
    }
    return member;
  }

  async update(id: string, data: UpdateTeamMemberDto) {
    await this.findOne(id);
    return this.prisma.teamMember.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.teamMember.delete({ where: { id } });
  }
}
