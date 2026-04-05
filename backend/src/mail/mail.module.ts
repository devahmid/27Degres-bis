import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const smtpUser = configService.get('SMTP_USER');
        const smtpFrom = configService.get('SMTP_FROM') || smtpUser;
        const port = parseInt(configService.get('SMTP_PORT', '587'), 10);
        const secureExplicit = configService.get('SMTP_SECURE', 'false') === 'true';
        // Port 465 = soumission SSL directe (implicit TLS)
        const secure = secureExplicit || port === 465;

        return {
          transport: {
            host: configService.get('SMTP_HOST', 'smtp.gmail.com'),
            port,
            secure,
            auth: {
              user: smtpUser,
              pass: configService.get('SMTP_PASSWORD'),
            },
            tls: {
              rejectUnauthorized: false,
            },
            logger: false,
            debug: false,
            // Pool de connexions pour améliorer les performances
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
          },
          defaults: {
            // Utiliser SMTP_USER comme adresse d'envoi pour garantir la cohérence
            from: `"Association 27 Degrés" <${smtpUser}>`,
            replyTo: smtpUser,
            // Headers pour améliorer la délivrabilité
            headers: {
              'X-Mailer': 'Association 27 Degrés',
              'X-Priority': '3',
              'X-MSMail-Priority': 'Normal',
              'List-Unsubscribe': `<mailto:${smtpUser}?subject=unsubscribe>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

