import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from './event.entity';

@Entity('event_feedbacks')
@Unique(['eventId', 'userId'])
export class EventFeedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'event_id' })
  eventId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'overall_rating', type: 'smallint' })
  overallRating: number;

  @Column({ name: 'organization_rating', type: 'smallint' })
  organizationRating: number;

  @Column({ name: 'atmosphere_rating', type: 'smallint' })
  atmosphereRating: number;

  @Column({ name: 'community_impact_rating', type: 'smallint' })
  communityImpactRating: number;

  @Column({ type: 'text', nullable: true })
  highlights?: string;

  @Column({ type: 'text' })
  improvements: string;

  @Column({ name: 'would_recommend', default: true })
  wouldRecommend: boolean;

  @Column({ name: 'additional_comments', type: 'text', nullable: true })
  additionalComments?: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
