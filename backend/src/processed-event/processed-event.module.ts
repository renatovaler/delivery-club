import { Module } from '@nestjs/common';
import { ProcessedEventController } from './processed-event.controller';
import { ProcessedEventService } from './processed-event.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProcessedEventController],
  providers: [ProcessedEventService],
})
export class ProcessedEventModule {}
