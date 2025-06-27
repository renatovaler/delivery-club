import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNumber } from 'class-validator';

export class CreateSubscriptionItemDto {
  @ApiProperty()
  @IsString()
  subscription_id: string;

  @ApiProperty()
  @IsString()
  product_id: string;

  @ApiProperty()
  @IsInt()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  price_at_time: number;
}

export class UpdateSubscriptionItemDto extends CreateSubscriptionItemDto {}
