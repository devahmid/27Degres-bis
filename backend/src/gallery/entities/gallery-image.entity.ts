import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('gallery_images')
export class GalleryImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'image_url', length: 500 })
  imageUrl: string;

  @Column({ name: 'file_path', length: 500, nullable: true })
  filePath?: string; // Pour les images privées (URLs signées)

  @Column({ type: 'text', nullable: true })
  caption?: string;

  @Column({ name: 'is_public', default: true })
  isPublic: boolean;

  @Column({ name: 'category', nullable: true, length: 100 })
  category?: string;

  @Column({ name: 'uploaded_by', nullable: true })
  uploadedBy?: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploaded_by' })
  uploader?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
