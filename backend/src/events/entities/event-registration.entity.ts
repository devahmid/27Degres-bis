import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Event } from './event.entity';
import { User } from '../../users/entities/user.entity';

@Entity('event_registrations')
@Unique(['eventId', 'userId'])
export class EventRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'event_id' })
  eventId: number;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'availability_type', type: 'varchar', length: 20, nullable: true, default: 'full' })
  availabilityType?: 'full' | 'partial';

  @Column({ name: 'availability_details', type: 'text', nullable: true })
  availabilityDetails?: string;

  @Column({ name: 'is_volunteer', type: 'boolean', default: false })
  isVolunteer: boolean;

  @Column({ name: 'volunteer_activities', type: 'text', nullable: true })
  volunteerActivities?: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'registered_at' })
  registeredAt: Date;
}









