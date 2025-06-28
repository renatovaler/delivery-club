import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';

enum ReportCategory {
  FRAUD = 'fraud',
  POOR_SERVICE = 'poor_service',
  PRODUCT_QUALITY = 'product_quality',
  DELIVERY_ISSUES = 'delivery_issues',
  OVERCHARGING = 'overcharging',
  HARASSMENT = 'harassment',
  SPAM = 'spam',
  OTHER = 'other'
}

enum ReportSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum ReportStatus {
  PENDING = 'pending',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

export class CreatePlatformReportDto {
  @IsString()
  reporter_id: string;

  @IsString()
  reported_team_id: string;

  @IsString()
  @IsOptional()
  reported_user_id?: string;

  @IsEnum(ReportCategory)
  category: ReportCategory;

  @IsEnum(ReportSeverity)
  @IsOptional()
  severity?: ReportSeverity = 'medium';

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  evidence_urls?: string[];
}

export class UpdatePlatformReportDto {
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @IsString()
  @IsOptional()
  admin_notes?: string;

  @IsString()
  @IsOptional()
  resolution?: string;
}
