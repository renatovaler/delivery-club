import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TeamSubscriptionHistoryService } from './team-subscription-history.service';
import { CreateTeamSubscriptionHistoryDto, UpdateTeamSubscriptionHistoryDto } from './dto/team-subscription-history.dto';

@Controller('team-subscription-histories')
export class TeamSubscriptionHistoryController {
  constructor(private readonly teamSubscriptionHistoryService: TeamSubscriptionHistoryService) {}

  @Post()
  create(@Body() createTeamSubscriptionHistoryDto: CreateTeamSubscriptionHistoryDto) {
    return this.teamSubscriptionHistoryService.create(createTeamSubscriptionHistoryDto);
  }

  @Get()
  findAll() {
    return this.teamSubscriptionHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamSubscriptionHistoryService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTeamSubscriptionHistoryDto: UpdateTeamSubscriptionHistoryDto) {
    return this.teamSubscriptionHistoryService.update(id, updateTeamSubscriptionHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamSubscriptionHistoryService.remove(id);
  }
}
