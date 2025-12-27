import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './entities/contact-message.entity';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private contactMessagesRepository: Repository<ContactMessage>,
  ) {}

  async create(createContactMessageDto: CreateContactMessageDto): Promise<ContactMessage> {
    const message = this.contactMessagesRepository.create(createContactMessageDto);
    return this.contactMessagesRepository.save(message);
  }
}









