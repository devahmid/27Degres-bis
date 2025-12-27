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

  @CreateDateColumn({ name: 'registered_at' })
  registeredAt: Date;
}









