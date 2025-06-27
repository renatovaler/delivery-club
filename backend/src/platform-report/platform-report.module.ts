import { Module } from '@nestjs/common';
import { PlatformReportController } from './platform-report.controller';
import { PlatformReportService } from './platform-report.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlatformReportController],
  providers: [PlatformReportService],
})
export class PlatformReportModule {}
