import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ExpenseCategory {
  LOCATION_SALLE = 'location_salle',
  MATERIEL = 'materiel',
  TRANSPORT = 'transport',
  COMMUNICATION = 'communication',
  ASSURANCE = 'assurance',
  FRAIS_BANCAIRES = 'frais_bancaires',
  EVENEMENTS = 'evenements',
  ADMINISTRATIF = 'administratif',
  AUTRE = 'autre',
}

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ExpenseCategory,
  })
  category: ExpenseCategory;

  @Column()
  year: number;

  @Column({ name: 'receipt_url', nullable: true, length: 500 })
  receiptUrl?: string;

  @Column({ name: 'created_by' })
  createdBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'validated_by', nullable: true })
  validatedBy?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'validated_by' })
  validator?: User;

  @Column({ name: 'validated_at', type: 'timestamp', nullable: true })
  validatedAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
