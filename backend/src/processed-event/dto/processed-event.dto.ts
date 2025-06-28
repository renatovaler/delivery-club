import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateProcessedEventDto {
  @IsString()
  stripe_event_id: string;

  @IsDateString()
  @IsOptional()
  processed_at?: string;
}

export class UpdateProcessedEventDto {
  @IsString()
  @IsOptional()
  stripe_event_id?: string;

  @IsDateString()
  @IsOptional()
  processed_at?: string;
}
