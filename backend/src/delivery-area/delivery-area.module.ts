import { Module } from '@nestjs/common';
import { DeliveryAreaController } from './delivery-area.controller';
import { DeliveryAreaService } from './delivery-area.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DeliveryAreaController],
  providers: [DeliveryAreaService],
})
export class DeliveryAreaModule {}
