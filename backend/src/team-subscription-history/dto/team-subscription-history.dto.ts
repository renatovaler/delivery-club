import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateTeamSubscriptionHistoryDto {
  @ApiProperty()
  @IsString()
  team_id: string;

  @ApiProperty()
  @IsString()
  subscription_id: string;

  @ApiProperty()
  @IsDateString()
  change_date: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  details?: string;
}

export class UpdateTeamSubscriptionHistoryDto extends CreateTeamSubscriptionHistoryDto {}
