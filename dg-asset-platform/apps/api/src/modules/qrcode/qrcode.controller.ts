import { Body, Controller, Get, Header, Param, Post, StreamableFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QrcodeService } from './qrcode.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('qrcode')
@Controller()
export class QrcodeController {
  constructor(private readonly qrcodeService: QrcodeService) {}

  @Post('assets/:assetId/qrcode')
  @RequirePermissions('qrcode:issue')
  issue(@Param('assetId') assetId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.qrcodeService.issue(assetId, user);
  }

  @Post('assets/:assetId/qrcode/reprint')
  @RequirePermissions('qrcode:reprint')
  reprint(@Param('assetId') assetId: string, @Body('reason') reason: string, @CurrentUser() user: AuthenticatedUser) {
    return this.qrcodeService.reprint(assetId, reason, user);
  }

  @Post('assets/:assetId/qrcode/replace')
  @RequirePermissions('qrcode:reprint')
  replace(@Param('assetId') assetId: string, @Body('reason') reason: string, @CurrentUser() user: AuthenticatedUser) {
    return this.qrcodeService.replace(assetId, reason, user);
  }

  @Post('assets/:assetId/qrcode/deactivate')
  @RequirePermissions('qrcode:manage')
  deactivate(@Param('assetId') assetId: string, @Body('reason') reason: string, @CurrentUser() user: AuthenticatedUser) {
    return this.qrcodeService.deactivate(assetId, reason, user);
  }

  @Get('assets/:assetId/qrcode/history')
  @RequirePermissions('qrcode:read')
  history(@Param('assetId') assetId: string) {
    return this.qrcodeService.history(assetId);
  }

  @Get('assets/:assetId/qrcode.png')
  @RequirePermissions('qrcode:read')
  @Header('Content-Type', 'image/png')
  async png(@Param('assetId') assetId: string) {
    const buffer = await this.qrcodeService.renderPng(assetId);
    return new StreamableFile(buffer);
  }

  @Get('assets/:assetId/label.png')
  @RequirePermissions('qrcode:read')
  @Header('Content-Type', 'image/png')
  async label(@Param('assetId') assetId: string) {
    const buffer = await this.qrcodeService.renderLabelPng(assetId);
    return new StreamableFile(buffer);
  }

  @Get('qr/:token')
  @RequirePermissions('assets:read')
  resolve(@Param('token') token: string, @CurrentUser() user: AuthenticatedUser) {
    return this.qrcodeService.resolveToken(token, user);
  }
}
