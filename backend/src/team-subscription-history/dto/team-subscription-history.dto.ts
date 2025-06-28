import { IsString, IsObject, IsOptional } from 'class-validator';

export class CreateTeamSubscriptionHistoryDto {
  @IsString()
  team_id: string;

  @IsString()
  subscription_id: string;

  @IsString()
  change_type: string;

  @IsObject()
  old_data: object;

  @IsObject()
  new_data: object;

  @IsString()
  changed_by: string;
}

export class UpdateTeamSubscriptionHistoryDto {
  @IsString()
  @IsOptional()
  change_type?: string;

  @IsObject()
  @IsOptional()
  old_data?: object;

  @IsObject()
  @IsOptional()
  new_data?: object;

  @IsString()
  @IsOptional()
  changed_by?: string;
}
