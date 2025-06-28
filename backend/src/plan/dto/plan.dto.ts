import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price: number;

  @IsNumber()
  max_subscriptions: number;

  @IsNumber()
  max_products: number;

  @IsNumber()
  @IsOptional()
  max_services?: number;

  @IsString()
  @IsOptional()
  status?: string = 'active';
}

export class UpdatePlanDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  max_subscriptions?: number;

  @IsNumber()
  @IsOptional()
  max_products?: number;

  @IsNumber()
  @IsOptional()
  max_services?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
