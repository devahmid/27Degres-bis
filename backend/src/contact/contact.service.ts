import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './entities/contact-message.entity';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private contactMessagesRepository: Repository<ContactMessage>,
    private mailService: MailService,
  ) {}

  async create(createContactMessageDto: CreateContactMessageDto): Promise<ContactMessage> {
    const message = this.contactMessagesRepository.create(createContactMessageDto);
    const savedMessage = await this.contactMessagesRepository.save(message);
    
    // Envoyer un email de notification
    try {
      await this.mailService.sendContactEmail({
        name: createContactMessageDto.name,
        email: createContactMessageDto.email,
        subject: createContactMessageDto.subject || 'Message de contact',
        message: createContactMessageDto.message,
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de contact:', error);
      // Ne pas faire échouer la création du message si l'email échoue
    }
    
    return savedMessage;
  }

  async findAll(): Promise<ContactMessage[]> {
    return this.contactMessagesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ContactMessage> {
    const message = await this.contactMessagesRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message avec l'ID ${id} non trouvé`);
    }
    return message;
  }

  async markAsRead(id: number): Promise<ContactMessage> {
    const message = await this.findOne(id);
    message.isRead = true;
    return this.contactMessagesRepository.save(message);
  }

  async remove(id: number): Promise<void> {
    const message = await this.findOne(id);
    await this.contactMessagesRepository.remove(message);
  }

  async reply(id: number, replyMessage: string, fromName?: string): Promise<void> {
    const message = await this.findOne(id);
    
    // Envoyer la réponse par email
    await this.mailService.sendMemberMessage(
      message.email,
      `Re: ${message.subject || 'Message de contact'}`,
      replyMessage,
      fromName || 'Association 27 Degrés'
    );
    
    // Marquer comme lu
    await this.markAsRead(id);
  }
}









