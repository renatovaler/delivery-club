import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TeamChangeHistoryService } from './team-change-history.service';
import { CreateTeamChangeHistoryDto, UpdateTeamChangeHistoryDto } from './dto/team-change-history.dto';

@Controller('team-change-histories')
export class TeamChangeHistoryController {
  constructor(private readonly teamChangeHistoryService: TeamChangeHistoryService) {}

  @Post()
  create(@Body() createTeamChangeHistoryDto: CreateTeamChangeHistoryDto) {
    return this.teamChangeHistoryService.create(createTeamChangeHistoryDto);
  }

  @Get()
  findAll() {
    return this.teamChangeHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamChangeHistoryService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTeamChangeHistoryDto: UpdateTeamChangeHistoryDto) {
    return this.teamChangeHistoryService.update(id, updateTeamChangeHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamChangeHistoryService.remove(id);
  }
}
