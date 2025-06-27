import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TeamMemberService } from './team-member.service';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from './dto/team-member.dto';

@Controller('team-members')
export class TeamMemberController {
  constructor(private readonly teamMemberService: TeamMemberService) {}

  @Post()
  create(@Body() createTeamMemberDto: CreateTeamMemberDto) {
    return this.teamMemberService.create(createTeamMemberDto);
  }

  @Get()
  findAll() {
    return this.teamMemberService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamMemberService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTeamMemberDto: UpdateTeamMemberDto) {
    return this.teamMemberService.update(id, updateTeamMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamMemberService.remove(id);
  }
}
