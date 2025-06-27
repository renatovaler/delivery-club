import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateProcessedEventDto {
  @ApiProperty()
  @IsString()
  event_type: string;

  @ApiProperty()
  @IsDateString()
  event_date: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  details?: string;
}

export class UpdateProcessedEventDto extends CreateProcessedEventDto {}
