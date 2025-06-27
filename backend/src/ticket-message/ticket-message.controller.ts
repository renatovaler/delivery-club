import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TicketMessageService } from './ticket-message.service';
import { CreateTicketMessageDto, UpdateTicketMessageDto } from './dto/ticket-message.dto';

@Controller('ticket-messages')
export class TicketMessageController {
  constructor(private readonly ticketMessageService: TicketMessageService) {}

  @Post()
  create(@Body() createTicketMessageDto: CreateTicketMessageDto) {
    return this.ticketMessageService.create(createTicketMessageDto);
  }

  @Get()
  findAll() {
    return this.ticketMessageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketMessageService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTicketMessageDto: UpdateTicketMessageDto) {
    return this.ticketMessageService.update(id, updateTicketMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketMessageService.remove(id);
  }
}
