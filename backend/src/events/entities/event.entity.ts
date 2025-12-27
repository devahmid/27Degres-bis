import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { EventRegistration } from './event-registration.entity';
import { EventImage } from './event-image.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ unique: true, length: 250 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  type?: 'weekend' | 'reunion' | 'activite';

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate?: Date;

  @Column({ nullable: true, length: 255 })
  location?: string;

  @Column({ name: 'max_participants', nullable: true })
  maxParticipants?: number;

  @Column({ name: 'featured_image', nullable: true, length: 500 })
  featuredImage?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'draft',
  })
  status: 'draft' | 'published' | 'cancelled';

  @Column({ name: 'created_by', nullable: true })
  createdBy?: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => EventRegistration, (registration) => registration.event)
  registrations: EventRegistration[];

  @OneToMany(() => EventImage, (image) => image.event)
  images: EventImage[];
}









