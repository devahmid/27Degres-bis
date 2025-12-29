import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { DeliveryMethod } from './delivery-method.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'varchar',
    length: 20,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'delivery_method_id', nullable: true })
  deliveryMethodId?: number;

  @ManyToOne(() => DeliveryMethod, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'delivery_method_id' })
  deliveryMethod?: DeliveryMethod;

  @Column({ name: 'delivery_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryCost: number;

  @Column({ name: 'shipping_address', type: 'text', nullable: true })
  shippingAddress?: string;

  @Column({ name: 'payment_method', nullable: true, length: 50 })
  paymentMethod?: string;

  @Column({ name: 'payment_status', type: 'varchar', length: 20, default: 'pending' })
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';

  @Column({ name: 'transaction_id', nullable: true, length: 255 })
  transactionId?: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

