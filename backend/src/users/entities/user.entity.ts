import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Cotisation } from '../../cotisations/entities/cotisation.entity';
import { Event } from '../../events/entities/event.entity';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../posts/entities/comment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'membre',
  })
  role: 'admin' | 'bureau' | 'membre' | 'visiteur';

  @Column({ nullable: true, length: 20 })
  phone?: string;

  @Column({ name: 'address_street', nullable: true, length: 255 })
  addressStreet?: string;

  @Column({ name: 'address_city', nullable: true, length: 100 })
  addressCity?: string;

  @Column({ name: 'address_postal_code', nullable: true, length: 10 })
  addressPostalCode?: string;

  @Column({ name: 'join_date', type: 'date', default: () => 'CURRENT_DATE' })
  joinDate: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'avatar_url', nullable: true, length: 500 })
  avatarUrl?: string;

  @Column({ name: 'consent_annuaire', default: false })
  consentAnnuaire: boolean;

  @Column({ name: 'consent_newsletter', default: false })
  consentNewsletter: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Cotisation, (cotisation) => cotisation.user)
  cotisations: Cotisation[];

  @OneToMany(() => Event, (event) => event.createdBy)
  events: Event[];

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}

