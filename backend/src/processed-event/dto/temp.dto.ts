import { IsString } from 'class-validator';

export class CreateProcessedEventDto {
  @IsString()
  stripe_event_id: string;
}

export class UpdateProcessedEventDto {
  @IsString()
  stripe_event_id: string;
}
