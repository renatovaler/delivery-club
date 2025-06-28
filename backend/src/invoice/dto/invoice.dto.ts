import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  subscription_id: string;

  @IsString()
  customer_id: string;

  @IsString()
  team_id: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  billing_period_start: string;

  @IsDateString()
  billing_period_end: string;

  @IsDateString()
  due_date: string;

  @IsDateString()
  @IsOptional()
  paid_date?: string;

  @IsString()
  @IsOptional()
  stripe_invoice_id?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateInvoiceDto {
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsDateString()
  @IsOptional()
  paid_date?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  stripe_invoice_id?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
