import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AssetsModule } from './modules/assets/assets.module';
import { OcrModule } from './modules/ocr/ocr.module';
import { QrcodeModule } from './modules/qrcode/qrcode.module';
import { MovementsModule } from './modules/movements/movements.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { BreakdownsModule } from './modules/breakdowns/breakdowns.module';
import { StockModule } from './modules/stock/stock.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { OrgModule } from './modules/org/org.module';
import { AuditModule } from './modules/audit/audit.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { ReportsModule } from './modules/reports/reports.module';
import { IntegrationHubModule } from './modules/integration-hub/integration-hub.module';
import { ImportExportModule } from './modules/import-export/import-export.module';
import { SyncModule } from './modules/sync/sync.module';
import { HealthController } from './health.controller';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 200 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrgModule,
    AssetsModule,
    OcrModule,
    QrcodeModule,
    MovementsModule,
    MaintenanceModule,
    BreakdownsModule,
    StockModule,
    DocumentsModule,
    AuditModule,
    AlertsModule,
    ReportsModule,
    IntegrationHubModule,
    ImportExportModule,
    SyncModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
