import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';

enum TicketType {
  SUPPORT = 'support',
  COMPLAINT = 'complaint',
  SUGGESTION = 'suggestion',
  DELIVERY_ISSUE = 'delivery_issue',
  PRODUCT_ISSUE = 'product_issue',
  BILLING_ISSUE = 'billing_issue'
}

enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_CUSTOMER = 'waiting_customer',
  WAITING_BUSINESS = 'waiting_business',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export class CreateSupportTicketDto {
  @IsString()
  customer_id: string;

  @IsString()
  @IsOptional()
  team_id?: string;

  @IsString()
  @IsOptional()
  subscription_id?: string;

  @IsEnum(TicketType)
  type: TicketType;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @IsString()
  subject: string;

  @IsString()
  description: string;
}

export class UpdateSupportTicketDto {
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @IsString()
  @IsOptional()
  assigned_to?: string;

  @IsString()
  @IsOptional()
  resolution?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsString()
  @IsOptional()
  rating_comment?: string;
}
