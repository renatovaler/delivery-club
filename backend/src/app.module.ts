import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TeamModule } from './team/team.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ProductModule } from './product/product.module';
import { InvoiceModule } from './invoice/invoice.module';
import { DeliveryAreaModule } from './delivery-area/delivery-area.module';
import { ExpenseModule } from './expense/expense.module';
import { NotificationModule } from './notification/notification.module';
import { PlanModule } from './plan/plan.module';
import { PlatformReportModule } from './platform-report/platform-report.module';
import { ProcessedEventModule } from './processed-event/processed-event.module';
import { SubscriptionItemModule } from './subscription-item/subscription-item.module';
import { SupportTicketModule } from './support-ticket/support-ticket.module';
import { TeamChangeHistoryModule } from './team-change-history/team-change-history.module';
import { TeamMemberModule } from './team-member/team-member.module';
import { TeamSubscriptionHistoryModule } from './team-subscription-history/team-subscription-history.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    TeamModule,
    SubscriptionModule,
    ProductModule,
    InvoiceModule,
    DeliveryAreaModule,
    ExpenseModule,
    NotificationModule,
    PlanModule,
    PlatformReportModule,
    ProcessedEventModule,
    SubscriptionItemModule,
    SupportTicketModule,
    TeamChangeHistoryModule,
    TeamMemberModule,
    TeamSubscriptionHistoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
