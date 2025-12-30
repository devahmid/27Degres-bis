import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-member-message')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  async sendMemberMessage(@Body() body: { to: string; subject: string; message: string }) {
    await this.mailService.sendMemberMessage(body.to, body.subject, body.message);
    return { message: 'Message envoyé avec succès' };
  }
}

