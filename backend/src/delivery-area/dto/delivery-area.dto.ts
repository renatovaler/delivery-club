import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateDeliveryAreaDto {
  @ApiProperty()
  @IsString()
  team_id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ['active', 'inactive'], default: 'active' })
  @IsEnum(['active', 'inactive'])
  status: string;
}

export class UpdateDeliveryAreaDto extends CreateDeliveryAreaDto {}
