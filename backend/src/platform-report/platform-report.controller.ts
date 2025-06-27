import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { PlatformReportService } from './platform-report.service';
import { CreatePlatformReportDto, UpdatePlatformReportDto } from './dto/platform-report.dto';

@Controller('platform-reports')
export class PlatformReportController {
  constructor(private readonly platformReportService: PlatformReportService) {}

  @Post()
  create(@Body() createPlatformReportDto: CreatePlatformReportDto) {
    return this.platformReportService.create(createPlatformReportDto);
  }

  @Get()
  findAll() {
    return this.platformReportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.platformReportService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePlatformReportDto: UpdatePlatformReportDto) {
    return this.platformReportService.update(id, updatePlatformReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.platformReportService.remove(id);
  }
}
