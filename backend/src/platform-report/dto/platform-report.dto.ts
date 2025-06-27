import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreatePlatformReportDto {
  @ApiProperty()
  @IsString()
  team_id: string;

  @ApiProperty()
  @IsString()
  report_type: string;

  @ApiProperty()
  @IsDateString()
  report_date: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;
}

export class UpdatePlatformReportDto extends CreatePlatformReportDto {}
