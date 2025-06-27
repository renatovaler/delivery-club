import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { SubscriptionItemService } from './subscription-item.service';
import { CreateSubscriptionItemDto, UpdateSubscriptionItemDto } from './dto/subscription-item.dto';

@Controller('subscription-items')
export class SubscriptionItemController {
  constructor(private readonly subscriptionItemService: SubscriptionItemService) {}

  @Post()
  create(@Body() createSubscriptionItemDto: CreateSubscriptionItemDto) {
    return this.subscriptionItemService.create(createSubscriptionItemDto);
  }

  @Get()
  findAll() {
    return this.subscriptionItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionItemService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateSubscriptionItemDto: UpdateSubscriptionItemDto) {
    return this.subscriptionItemService.update(id, updateSubscriptionItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionItemService.remove(id);
  }
}
