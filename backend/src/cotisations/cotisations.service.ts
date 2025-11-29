import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cotisation } from './entities/cotisation.entity';
import { CreateCotisationDto } from './dto/create-cotisation.dto';

@Injectable()
export class CotisationsService {
  constructor(
    @InjectRepository(Cotisation)
    private cotisationsRepository: Repository<Cotisation>,
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

  async updateStatus(id: number, status: 'paid' | 'pending' | 'overdue', transactionId?: string): Promise<Cotisation> {
    const cotisation = await this.cotisationsRepository.findOne({ where: { id } });
    if (!cotisation) {
      throw new NotFoundException(`Cotisation with ID ${id} not found`);
    }
    cotisation.status = status;
    if (transactionId) {
      cotisation.transactionId = transactionId;
    }
    if (status === 'paid') {
      cotisation.paymentDate = new Date();
    }
    return this.cotisationsRepository.save(cotisation);
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

  async getStatistics() {
    const currentYear = new Date().getFullYear();
    const all = await this.cotisationsRepository.find();
    const currentYearCotisations = await this.cotisationsRepository.find({
      where: { year: currentYear },
    });

    return {
      total: all.length,
      currentYear: currentYearCotisations.length,
      paid: currentYearCotisations.filter(c => c.status === 'paid').length,
      pending: currentYearCotisations.filter(c => c.status === 'pending').length,
      overdue: currentYearCotisations.filter(c => c.status === 'overdue').length,
      totalAmount: currentYearCotisations.reduce((sum, c) => sum + Number(c.amount), 0),
      paidAmount: currentYearCotisations
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + Number(c.amount), 0),
    };
  }
}

