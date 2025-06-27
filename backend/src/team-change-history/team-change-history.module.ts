import { Module } from '@nestjs/common';
import { TeamChangeHistoryController } from './team-change-history.controller';
import { TeamChangeHistoryService } from './team-change-history.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeamChangeHistoryController],
  providers: [TeamChangeHistoryService],
})
export class TeamChangeHistoryModule {}
