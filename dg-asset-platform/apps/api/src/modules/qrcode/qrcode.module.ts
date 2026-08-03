import { Module } from '@nestjs/common';
import { QrcodeService } from './qrcode.service';
import { QrcodeController } from './qrcode.controller';
import { QrEligibilityService } from './application/qr-eligibility.service';
import { LabelRendererService } from './application/label-renderer.service';

@Module({
  providers: [QrcodeService, QrEligibilityService, LabelRendererService],
  controllers: [QrcodeController],
  exports: [QrcodeService],
})
export class QrcodeModule {}
