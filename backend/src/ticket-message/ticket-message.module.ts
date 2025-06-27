import { Module } from '@nestjs/common';
import { TicketMessageController } from './ticket-message.controller';
import { TicketMessageService } from './ticket-message.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TicketMessageController],
  providers: [TicketMessageService],
})
export class TicketMessageModule {}
