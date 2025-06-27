import { Module } from '@nestjs/common';
import { SubscriptionItemController } from './subscription-item.controller';
import { SubscriptionItemService } from './subscription-item.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubscriptionItemController],
  providers: [SubscriptionItemService],
})
export class SubscriptionItemModule {}
