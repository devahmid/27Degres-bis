import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendContactEmail(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    await this.mailerService.sendMail({
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      subject: `[Contact] ${contactData.subject}`,
      template: 'contact',
      context: {
        name: contactData.name,
        email: contactData.email,
        subject: contactData.subject,
        message: contactData.message,
      },
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>De:</strong> ${contactData.name} (${contactData.email})</p>
        <p><strong>Sujet:</strong> ${contactData.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${contactData.message.replace(/\n/g, '<br>')}</p>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string, resetUrl: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Association 27 Degrés',
      html: `
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <p><a href="${resetUrl}?token=${resetToken}" style="background-color: #E94E1B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Réinitialiser mon mot de passe</a></p>
        <p>Ou copiez ce lien dans votre navigateur :</p>
        <p>${resetUrl}?token=${resetToken}</p>
        <p>Ce lien est valide pendant 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        <hr>
        <p><small>Association 27 Degrés</small></p>
      `,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Bienvenue à l\'Association 27 Degrés',
      html: `
        <h2>Bienvenue ${firstName} !</h2>
        <p>Votre compte a été créé avec succès sur le site de l'Association 27 Degrés.</p>
        <p>Vous pouvez maintenant vous connecter et accéder à tous les services de l'association.</p>
        <p>À bientôt !</p>
        <hr>
        <p><small>Association 27 Degrés</small></p>
      `,
    });
  }

  async sendOrderConfirmationEmail(email: string, orderId: number, orderTotal: number): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: `Confirmation de commande #${orderId} - Association 27 Degrés`,
      html: `
        <h2>Confirmation de commande</h2>
        <p>Votre commande #${orderId} a été enregistrée avec succès.</p>
        <p><strong>Montant total:</strong> ${orderTotal.toFixed(2)} €</p>
        <p>Vous recevrez un email de suivi lorsque votre commande sera expédiée.</p>
        <p>Merci pour votre achat !</p>
        <hr>
        <p><small>Association 27 Degrés</small></p>
      `,
    });
  }

  async sendMemberMessage(email: string, subject: string, message: string, fromName?: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: subject,
      html: `
        <h2>${subject}</h2>
        ${fromName ? `<p><strong>De:</strong> ${fromName}</p>` : ''}
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Association 27 Degrés</small></p>
      `,
    });
  }
}

