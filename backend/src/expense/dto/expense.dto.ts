import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  team_id: string;

  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsString()
  category: string;

  @IsDateString()
  date: string;
}

export class UpdateExpenseDto {
  @IsString()
  description?: string;

  @IsNumber()
  amount?: number;

  @IsString()
  category?: string;

  @IsDateString()
  date?: string;
}
