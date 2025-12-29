import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ name: 'file_path', length: 500, nullable: true })
  filePath?: string; // Pour les images stockées dans Supabase

  @Column({ name: 'stock_quantity', default: 0 })
  stockQuantity: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'active',
  })
  status: 'active' | 'inactive' | 'sold_out';

  @Column({ name: 'category', nullable: true, length: 100 })
  category?: string; // Ex: 'tshirt', 'accessoire', etc.

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

