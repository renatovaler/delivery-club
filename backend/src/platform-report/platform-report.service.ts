import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlatformReportDto, UpdatePlatformReportDto } from './dto/platform-report.dto';

@Injectable()
export class PlatformReportService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePlatformReportDto) {
    return this.prisma.platformReport.create({ data });
  }

  async findAll() {
    return this.prisma.platformReport.findMany();
  }

  async findOne(id: string) {
    const report = await this.prisma.platformReport.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException(`PlatformReport with ID ${id} not found`);
    }
    return report;
  }

  async update(id: string, data: UpdatePlatformReportDto) {
    await this.findOne(id);
    return this.prisma.platformReport.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.platformReport.delete({ where: { id } });
  }
}
