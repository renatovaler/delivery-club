import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, ValidateNested, IsObject } from 'class-validator';

export class DeliveryAddressDto {
  @ApiProperty()
  @IsString()
  street: string;

  @ApiProperty()
  @IsString()
  number: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiProperty()
  @IsString()
  neighborhood: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  zip_code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reference?: string;
}

export class CreateSubscriptionDto {
  @ApiProperty()
  @IsString()
  customer_id: string;

  @ApiProperty()
  @IsString()
  team_id: string;

  @ApiProperty()
  @IsString()
  delivery_area_id: string;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  delivery_address: DeliveryAddressDto;

  @ApiProperty()
  @IsNumber()
  monthly_price: number;

  @ApiProperty({ enum: ['active', 'paused', 'cancelled', 'pending_payment', 'past_due', 'trial'], default: 'pending_payment' })
  @IsEnum(['active', 'paused', 'cancelled', 'pending_payment', 'past_due', 'trial'])
  status: string;

  @ApiProperty()
  @IsDateString()
  start_date: string;

  @ApiProperty()
  @IsDateString()
  next_billing_date: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  cancellation_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  stripe_subscription_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  special_instructions?: string;
}

export class UpdateSubscriptionDto extends CreateSubscriptionDto {}
