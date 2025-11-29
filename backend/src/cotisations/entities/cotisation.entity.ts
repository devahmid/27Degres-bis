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

@Entity('cotisations')
export class Cotisation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  year: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status: 'paid' | 'pending' | 'overdue';

  @Column({ name: 'payment_date', type: 'date', nullable: true })
  paymentDate?: Date;

  @Column({ name: 'payment_method', nullable: true, length: 50 })
  paymentMethod?: string;

  @Column({ name: 'transaction_id', nullable: true, length: 255 })
  transactionId?: string;

  @Column({ name: 'receipt_url', nullable: true, length: 500 })
  receiptUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

