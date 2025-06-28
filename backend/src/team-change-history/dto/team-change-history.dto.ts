import { IsString, IsObject } from 'class-validator';

export class CreateTeamChangeHistoryDto {
  @IsString()
  team_id: string;

  @IsString()
  change_type: string;

  @IsObject()
  old_data: object;

  @IsObject()
  new_data: object;

  @IsString()
  changed_by: string;
}

export class UpdateTeamChangeHistoryDto {
  @IsString()
  change_type?: string;

  @IsObject()
  old_data?: object;

  @IsObject()
  new_data?: object;

  @IsString()
  changed_by?: string;
}
