import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateTeamChangeHistoryDto {
  @ApiProperty()
  @IsString()
  team_id: string;

  @ApiProperty()
  @IsString()
  change_type: string;

  @ApiProperty()
  @IsDateString()
  change_date: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  details?: string;
}

export class UpdateTeamChangeHistoryDto extends CreateTeamChangeHistoryDto {}
