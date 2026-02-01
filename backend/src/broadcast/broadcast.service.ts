import { Injectable, BadRequestException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { SendBroadcastEmailDto, BroadcastRecipientType } from './dto/send-broadcast-email.dto';

@Injectable()
export class BroadcastService {
  constructor(
    private mailService: MailService,
    private usersService: UsersService,
  ) {}

  async sendBroadcastEmail(dto: SendBroadcastEmailDto): Promise<{ sent: number; failed: number }> {
    let recipients: Array<{ email: string; firstName: string }> = [];

    // Déterminer les destinataires selon le type
    switch (dto.recipientType) {
      case BroadcastRecipientType.ALL_ACTIVE:
        const allActive = await this.usersService.findAll();
        recipients = allActive
          .filter(user => user.isActive && user.email)
          .map(user => ({ email: user.email, firstName: user.firstName || 'Membre' }));
        break;

      case BroadcastRecipientType.NEWSLETTER_SUBSCRIBERS:
        const newsletterSubscribers = await this.usersService.findActiveMembersWithNewsletter();
        recipients = newsletterSubscribers
          .filter(user => user.email)
          .map(user => ({ email: user.email, firstName: user.firstName || 'Membre' }));
        break;

      case BroadcastRecipientType.CUSTOM:
        if (!dto.customRecipients || dto.customRecipients.length === 0) {
          throw new BadRequestException('Aucun destinataire personnalisé fourni');
        }
        // Pour les destinataires personnalisés, on envoie sans le prénom personnalisé
        recipients = dto.customRecipients.map(email => ({ email, firstName: 'Membre' }));
        break;

      default:
        throw new BadRequestException('Type de destinataire invalide');
    }

    if (recipients.length === 0) {
      throw new BadRequestException('Aucun destinataire trouvé');
    }

    // Envoyer les emails
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        await this.mailService.sendBroadcastEmail(
          recipient.email,
          recipient.firstName,
          dto.subject,
          dto.message,
        );
        sent++;
      } catch (error) {
        console.error(`Erreur lors de l'envoi à ${recipient.email}:`, error);
        failed++;
      }
    }

    return { sent, failed };
  }
}
