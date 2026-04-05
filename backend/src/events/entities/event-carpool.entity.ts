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

export type EventCarpoolKind = 'offer' | 'seek';

@Entity('event_carpools')
@Unique(['eventId', 'userId', 'kind'])
export class EventCarpool {
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

  @Column({ type: 'varchar', length: 10 })
  kind: EventCarpoolKind;

  @Column({ name: 'departure_area', type: 'varchar', length: 255 })
  departureArea: string;

  @Column({ name: 'seats_offered', type: 'int', nullable: true })
  seatsOffered?: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
