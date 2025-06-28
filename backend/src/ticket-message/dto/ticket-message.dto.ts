import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';

enum SenderType {
  CUSTOMER = 'customer',
  BUSINESS = 'business',
  ADMIN = 'admin'
}

export class CreateTicketMessageDto {
  @IsString()
  ticket_id: string;

  @IsString()
  sender_id: string;

  @IsEnum(SenderType)
  sender_type: SenderType;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  attachment_url?: string;

  @IsBoolean()
  @IsOptional()
  is_internal?: boolean;
}

export class UpdateTicketMessageDto {
  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  attachment_url?: string;

  @IsBoolean()
  @IsOptional()
  is_internal?: boolean;
}
