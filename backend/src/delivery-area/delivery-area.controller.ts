import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { DeliveryAreaService } from './delivery-area.service';
import { CreateDeliveryAreaDto, UpdateDeliveryAreaDto } from './dto/delivery-area.dto';

@Controller('delivery-areas')
export class DeliveryAreaController {
  constructor(private readonly deliveryAreaService: DeliveryAreaService) {}

  @Post()
  create(@Body() createDeliveryAreaDto: CreateDeliveryAreaDto) {
    return this.deliveryAreaService.create(createDeliveryAreaDto);
  }

  @Get()
  findAll() {
    return this.deliveryAreaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliveryAreaService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDeliveryAreaDto: UpdateDeliveryAreaDto) {
    return this.deliveryAreaService.update(id, updateDeliveryAreaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliveryAreaService.remove(id);
  }
}
