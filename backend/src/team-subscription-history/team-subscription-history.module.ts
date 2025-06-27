import { Module } from '@nestjs/common';
import { TeamSubscriptionHistoryController } from './team-subscription-history.controller';
import { TeamSubscriptionHistoryService } from './team-subscription-history.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeamSubscriptionHistoryController],
  providers: [TeamSubscriptionHistoryService],
})
export class TeamSubscriptionHistoryModule {}
