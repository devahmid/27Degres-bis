import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'file_url', length: 500 })
  fileUrl: string;

  @Column({ name: 'file_path', length: 500, nullable: true })
  filePath?: string; // Chemin dans Supabase Storage (pour générer des URLs signées)

  @Column({ name: 'file_type', nullable: true, length: 50 })
  fileType?: string;

  @Column({ name: 'file_size', nullable: true })
  fileSize?: number;

  @Column({ nullable: true, length: 100 })
  category?: string;

  @Column({ name: 'uploaded_by', nullable: true })
  uploadedBy?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'uploaded_by' })
  uploader?: User;

  @Column({ name: 'assigned_to_user_id', nullable: true })
  assignedToUserId?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_user_id' })
  assignedToUser?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

