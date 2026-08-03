import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditListener } from './audit.listener';

@Module({
  providers: [AuditService, AuditListener],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}
