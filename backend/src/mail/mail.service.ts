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

  async sendEventRegistrationConfirmationEmail(
    email: string,
    firstName: string,
    eventTitle: string,
    eventStartDate: Date,
    eventLocation?: string,
    availabilityType?: string,
    availabilityDetails?: string,
    isVolunteer?: boolean,
    volunteerActivities?: string[],
    eventUrl?: string
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const eventLink = eventUrl || `${frontendUrl}/events/${eventStartDate}`;
    
    let availabilityText = '';
    if (availabilityType === 'partial' && availabilityDetails) {
      availabilityText = `<p><strong>Votre disponibilité:</strong> ${availabilityDetails}</p>`;
    } else {
      availabilityText = '<p><strong>Votre disponibilité:</strong> Tout le weekend</p>';
    }

    let volunteerText = '';
    if (isVolunteer && volunteerActivities && volunteerActivities.length > 0) {
      const activitiesLabels: Record<string, string> = {
        'courses': 'Courses / Achats',
        'keys': 'Récupération des clés',
        'cooking': 'Cuisine',
        'setup': 'Installation / Mise en place',
        'cleaning': 'Nettoyage',
        'other': 'Autre'
      };
      const activities = volunteerActivities
        .filter(a => !a.startsWith('other:'))
        .map(a => activitiesLabels[a] || a)
        .join(', ');
      volunteerText = `<p><strong>Vous vous êtes porté volontaire pour:</strong> ${activities}</p>`;
    }

    await this.mailerService.sendMail({
      to: email,
      subject: `Confirmation d'inscription - ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #E94E1B;">Confirmation d'inscription</h2>
          <p>Bonjour ${firstName},</p>
          <p>Votre inscription à l'événement <strong>${eventTitle}</strong> a été confirmée avec succès !</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1A3B5C;">Détails de l'événement</h3>
            <p><strong>Date:</strong> ${new Date(eventStartDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            ${eventLocation ? `<p><strong>Lieu:</strong> ${eventLocation}</p>` : ''}
            ${availabilityText}
            ${volunteerText}
          </div>

          <p>Vous pouvez consulter les détails de l'événement et gérer votre inscription en cliquant sur le lien ci-dessous :</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${eventLink}" style="background-color: #E94E1B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Voir l'événement</a>
          </p>

          <p>Nous avons hâte de vous voir !</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">Association 27 Degrés - Basse-Ville Génération</p>
        </div>
      `,
    });
  }

  async sendNewEventNotificationEmail(
    email: string,
    firstName: string,
    eventTitle: string,
    eventDescription: string,
    eventStartDate: Date,
    eventLocation?: string,
    eventUrl?: string
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const eventLink = eventUrl || `${frontendUrl}/events/${eventStartDate}`;

    await this.mailerService.sendMail({
      to: email,
      subject: `Nouvel événement : ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #E94E1B;">Nouvel événement disponible !</h2>
          <p>Bonjour ${firstName},</p>
          <p>Un nouvel événement vient d'être ajouté à l'agenda de l'association :</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1A3B5C;">${eventTitle}</h3>
            <p>${eventDescription.length > 200 ? eventDescription.substring(0, 200) + '...' : eventDescription}</p>
            <p><strong>Date:</strong> ${new Date(eventStartDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            ${eventLocation ? `<p><strong>Lieu:</strong> ${eventLocation}</p>` : ''}
          </div>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${eventLink}" style="background-color: #E94E1B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Voir les détails et s'inscrire</a>
          </p>

          <p>Ne manquez pas cet événement !</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">Association 27 Degrés - Basse-Ville Génération</p>
        </div>
      `,
    });
  }

  async sendCotisationConfirmationEmail(
    email: string,
    firstName: string,
    year: number,
    amount: number,
    paymentMethod?: string,
    transactionId?: string,
    receiptUrl?: string
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const receiptLink = receiptUrl || `${frontendUrl}/member/membership`;

    await this.mailerService.sendMail({
      to: email,
      subject: `Confirmation de cotisation ${year} - Association 27 Degrés`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #E94E1B;">Confirmation de paiement</h2>
          <p>Bonjour ${firstName},</p>
          <p>Votre cotisation pour l'année <strong>${year}</strong> a été enregistrée avec succès.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1A3B5C;">Détails du paiement</h3>
            <p><strong>Année:</strong> ${year}</p>
            <p><strong>Montant:</strong> ${amount.toFixed(2)} €</p>
            ${paymentMethod ? `<p><strong>Méthode de paiement:</strong> ${paymentMethod}</p>` : ''}
            ${transactionId ? `<p><strong>Numéro de transaction:</strong> ${transactionId}</p>` : ''}
          </div>

          ${receiptUrl ? `
            <p>Vous pouvez télécharger votre reçu en cliquant sur le lien ci-dessous :</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${receiptLink}" style="background-color: #E94E1B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Télécharger le reçu</a>
            </p>
          ` : ''}

          <p>Merci pour votre contribution à l'association !</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">Association 27 Degrés - Basse-Ville Génération</p>
        </div>
      `,
    });
  }

  async sendBroadcastEmail(
    email: string,
    firstName: string,
    subject: string,
    message: string
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #E94E1B;">${subject}</h2>
          <p>Bonjour ${firstName},</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">Association 27 Degrés - Basse-Ville Génération</p>
        </div>
      `,
    });
  }
}

