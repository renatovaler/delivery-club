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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
