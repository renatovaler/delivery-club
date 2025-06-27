import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateTicketMessageDto {
  @ApiProperty()
  @IsString()
  ticket_id: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsDateString()
  sent_at: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sender_id?: string;
}

export class UpdateTicketMessageDto extends CreateTicketMessageDto {}
