import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cotisation } from './entities/cotisation.entity';
import { CreateCotisationDto } from './dto/create-cotisation.dto';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { SendPaymentRemindersDto } from './dto/send-payment-reminders.dto';

@Injectable()
export class CotisationsService {
  constructor(
    @InjectRepository(Cotisation)
    private cotisationsRepository: Repository<Cotisation>,
    private mailService: MailService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async create(createCotisationDto: CreateCotisationDto): Promise<Cotisation> {
    const cotisation = this.cotisationsRepository.create(createCotisationDto);
    return this.cotisationsRepository.save(cotisation);
  }

  async findCurrentYear(userId: number): Promise<Cotisation | null> {
    const currentYear = new Date().getFullYear();
    return this.cotisationsRepository.findOne({
      where: { userId, year: currentYear },
    });
  }

  async findHistory(userId: number): Promise<Cotisation[]> {
    return this.cotisationsRepository.find({
      where: { userId },
      order: { year: 'DESC' },
    });
  }

  async updateStatus(id: number, status: 'paid' | 'pending' | 'overdue', transactionId?: string, paymentMethod?: string, receiptUrl?: string): Promise<Cotisation> {
    const cotisation = await this.cotisationsRepository.findOne({ where: { id } });
    if (!cotisation) {
      throw new NotFoundException(`Cotisation with ID ${id} not found`);
    }
    const previousStatus = cotisation.status;
    cotisation.status = status;
    if (transactionId) {
      cotisation.transactionId = transactionId;
    }
    if (paymentMethod) {
      cotisation.paymentMethod = paymentMethod;
    }
    if (receiptUrl) {
      cotisation.receiptUrl = receiptUrl;
    }
    if (status === 'paid') {
      cotisation.paymentDate = new Date();
    }
    const savedCotisation = await this.cotisationsRepository.save(cotisation);

    // Envoyer un email de confirmation si le statut passe à "paid"
    if (status === 'paid' && previousStatus !== 'paid') {
      try {
        const user = await this.usersService.findOne(cotisation.userId);
        await this.mailService.sendCotisationConfirmationEmail(
          user.email,
          user.firstName,
          savedCotisation.year,
          Number(savedCotisation.amount),
          savedCotisation.paymentMethod,
          savedCotisation.transactionId,
          savedCotisation.receiptUrl
        );
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de confirmation de cotisation:', error);
        // Ne pas faire échouer la mise à jour si l'email échoue
      }
    }

    return savedCotisation;
  }

  async findAll(): Promise<Cotisation[]> {
    return this.cotisationsRepository.find({
      relations: ['user'],
      order: { year: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByYear(year: number): Promise<Cotisation[]> {
    return this.cotisationsRepository.find({
      where: { year },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Cotisation> {
    const cotisation = await this.cotisationsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!cotisation) {
      throw new NotFoundException(`Cotisation with ID ${id} not found`);
    }
    return cotisation;
  }

  async update(id: number, updateData: Partial<Cotisation>): Promise<Cotisation> {
    await this.cotisationsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.cotisationsRepository.delete(id);
  }

  getPaymentInfoForMember(): {
    membershipUrl: string;
    ribDocumentUrl: string | null;
  } {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:4200');
    return {
      membershipUrl: `${frontendUrl}/member/membership`,
      ribDocumentUrl: this.configService.get<string>('RIB_DOCUMENT_URL') || null,
    };
  }

  async sendPaymentReminders(dto: SendPaymentRemindersDto): Promise<{ sent: number; failed: number }> {
    const year = dto.year ?? new Date().getFullYear();
    let cotisations: Cotisation[];

    if (dto.cotisationIds?.length) {
      cotisations = [];
      for (const id of dto.cotisationIds) {
        const c = await this.findOne(id);
        cotisations.push(c);
      }
    } else {
      cotisations = await this.findByYear(year);
      cotisations = cotisations.filter(c => c.status === 'pending' || c.status === 'overdue');
    }

    if (cotisations.length === 0) {
      throw new BadRequestException('Aucune cotisation à relancer pour ces critères');
    }

    const { membershipUrl, ribDocumentUrl } = this.getPaymentInfoForMember();
    let sent = 0;
    let failed = 0;

    for (const cotisation of cotisations) {
      if (cotisation.status === 'paid') {
        continue;
      }
      try {
        const user = await this.usersService.findOne(cotisation.userId);
        await this.mailService.sendCotisationReminderEmail(
          user.email,
          user.firstName || 'Membre',
          cotisation.year,
          Number(cotisation.amount),
          membershipUrl,
          ribDocumentUrl,
        );
        sent++;
      } catch (error) {
        console.error(`Erreur relance cotisation ${cotisation.id}:`, error);
        failed++;
      }
    }

    if (sent === 0 && failed === 0) {
      throw new BadRequestException('Aucun envoi : toutes les cotisations sélectionnées sont déjà payées');
    }

    return { sent, failed };
  }

  async getStatistics(year?: number) {
    const currentYear = year || new Date().getFullYear();
    const all = await this.cotisationsRepository.find();
    
    // Si une année est spécifiée, filtrer par cette année, sinon utiliser l'année en cours
    const filteredCotisations = await this.cotisationsRepository.find({
      where: { year: currentYear },
    });

    return {
      total: all.length,
      currentYear: filteredCotisations.length,
      paid: filteredCotisations.filter(c => c.status === 'paid').length,
      pending: filteredCotisations.filter(c => c.status === 'pending').length,
      overdue: filteredCotisations.filter(c => c.status === 'overdue').length,
      totalAmount: filteredCotisations.reduce((sum, c) => sum + Number(c.amount), 0),
      paidAmount: filteredCotisations
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + Number(c.amount), 0),
    };
  }
}

