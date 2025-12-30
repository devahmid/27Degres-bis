import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST', 'smtp.gmail.com'),
          port: configService.get('SMTP_PORT', 587),
          secure: configService.get('SMTP_SECURE', false), // true pour 465, false pour autres ports
          auth: {
            user: configService.get('SMTP_USER'),
            pass: configService.get('SMTP_PASSWORD'),
          },
          logger: false, // Désactiver les logs verbeux de Nodemailer
          debug: false, // Désactiver le mode debug
        },
        defaults: {
          from: `"Association 27 Degrés" <${configService.get('SMTP_USER')}>`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

