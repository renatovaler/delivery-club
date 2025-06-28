import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  team_id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  category: string;

  @IsNumber()
  price_per_session: number;

  @IsNumber()
  duration_minutes: number;

  @IsArray()
  @IsString({ each: true })
  available_days: string[];

  @IsArray()
  @IsString({ each: true })
  available_area_ids: string[];

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  price_per_session?: number;

  @IsNumber()
  @IsOptional()
  duration_minutes?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  available_days?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  available_area_ids?: string[];

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
