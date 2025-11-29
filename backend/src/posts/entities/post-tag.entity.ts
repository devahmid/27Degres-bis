import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('post_tags')
export class PostTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  name: string;
}

