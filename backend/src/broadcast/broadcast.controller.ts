import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { SendBroadcastEmailDto } from './dto/send-broadcast-email.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('broadcast')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class BroadcastController {
  constructor(private readonly broadcastService: BroadcastService) {}

  @Post('send-email')
  async sendBroadcastEmail(@Body() dto: SendBroadcastEmailDto) {
    return this.broadcastService.sendBroadcastEmail(dto);
  }
}
