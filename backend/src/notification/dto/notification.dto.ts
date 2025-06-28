import { IsString, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  user_id: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  status?: string = 'unread';

  @IsString()
  @IsOptional()
  link_to?: string;

  @IsString()
  @IsOptional()
  icon?: string;
}

export class UpdateNotificationDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  link_to?: string;

  @IsString()
  @IsOptional()
  icon?: string;
}
