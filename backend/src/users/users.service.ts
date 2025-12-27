import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Hash password if provided and not already hashed
    // Bcrypt hashes start with $2a$, $2b$, or $2y$
    if (createUserDto.password && !createUserDto.password.startsWith('$2')) {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      createUserDto = { ...createUserDto, password: hashedPassword };
    }
    
    const user = this.usersRepository.create({
      ...createUserDto,
      role: createUserDto.role || 'membre',
      isActive: true
    });
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findDirectory(): Promise<User[]> {
    return this.usersRepository.find({
      where: { consentAnnuaire: true, isActive: true },
      select: ['id', 'firstName', 'lastName', 'email', 'phone', 'addressCity', 'role'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    
    // Vérifier si l'utilisateur existe
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // Supprimer l'utilisateur
    // Les relations avec onDelete: 'SET NULL' ou 'CASCADE' seront gérées automatiquement
    await this.usersRepository.remove(user);
  }

  async getStatistics() {
    const all = await this.usersRepository.find();
    const active = await this.usersRepository.find({ where: { isActive: true } });
    const byRole = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    return {
      total: all.length,
      active: active.length,
      inactive: all.length - active.length,
      byRole: byRole.reduce((acc, item) => {
        acc[item.role] = parseInt(item.count);
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

