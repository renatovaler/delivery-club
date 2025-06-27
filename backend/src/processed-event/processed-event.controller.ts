import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ProcessedEventService } from './processed-event.service';
import { CreateProcessedEventDto, UpdateProcessedEventDto } from './dto/processed-event.dto';

@Controller('processed-events')
export class ProcessedEventController {
  constructor(private readonly processedEventService: ProcessedEventService) {}

  @Post()
  create(@Body() createProcessedEventDto: CreateProcessedEventDto) {
    return this.processedEventService.create(createProcessedEventDto);
  }

  @Get()
  findAll() {
    return this.processedEventService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.processedEventService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProcessedEventDto: UpdateProcessedEventDto) {
    return this.processedEventService.update(id, updateProcessedEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.processedEventService.remove(id);
  }
}
