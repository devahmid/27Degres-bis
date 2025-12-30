import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { DeliveryMethod } from './entities/delivery-method.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(DeliveryMethod)
    private deliveryMethodsRepository: Repository<DeliveryMethod>,
    private dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Vérifier et calculer les prix
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of createOrderDto.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: itemDto.productId },
        });

        if (!product) {
          throw new NotFoundException(`Produit avec ID ${itemDto.productId} non trouvé`);
        }

        if (product.status !== 'active') {
          throw new BadRequestException(`Le produit ${product.name} n'est pas disponible`);
        }

        if (product.stockQuantity < itemDto.quantity) {
          throw new BadRequestException(
            `Stock insuffisant pour ${product.name}. Disponible: ${product.stockQuantity}, Demandé: ${itemDto.quantity}`,
          );
        }

        const subtotal = Number(product.price) * itemDto.quantity;
        totalAmount += subtotal;

        // Réserver le stock (on le déduira lors de la confirmation)
        const orderItem = queryRunner.manager.create(OrderItem, {
          productId: product.id,
          quantity: itemDto.quantity,
          price: Number(product.price),
          subtotal,
        });

        orderItems.push(orderItem);
      }

      // Ajouter le coût de livraison
      let deliveryCost = 0;
      if (createOrderDto.deliveryMethodId) {
        const deliveryMethod = await queryRunner.manager.findOne(DeliveryMethod, {
          where: { id: createOrderDto.deliveryMethodId, isActive: true },
        });

        if (!deliveryMethod) {
          throw new NotFoundException('Méthode de livraison non trouvée ou inactive');
        }

        deliveryCost = Number(deliveryMethod.cost);
        totalAmount += deliveryCost;
      }

      // Créer la commande
      const order = queryRunner.manager.create(Order, {
        userId,
        status: OrderStatus.PENDING,
        totalAmount,
        deliveryMethodId: createOrderDto.deliveryMethodId,
        deliveryCost,
        shippingAddress: createOrderDto.shippingAddress,
        paymentMethod: createOrderDto.paymentMethod,
        paymentStatus: 'pending',
        notes: createOrderDto.notes,
      });

      const savedOrder = await queryRunner.manager.save(order);

      // Associer les items à la commande
      for (const item of orderItems) {
        item.orderId = savedOrder.id;
        await queryRunner.manager.save(item);
      }

      // Déduire le stock
      for (const itemDto of createOrderDto.items) {
        await queryRunner.manager.decrement(
          Product,
          { id: itemDto.productId },
          'stockQuantity',
          itemDto.quantity,
        );
      }

      await queryRunner.commitTransaction();

      // Retourner la commande avec ses relations
      return this.findOne(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId?: number): Promise<Order[]> {
    const queryBuilder = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.deliveryMethod', 'deliveryMethod')
      .leftJoinAndSelect('order.user', 'user')
      .orderBy('order.createdAt', 'DESC');

    if (userId) {
      queryBuilder.where('order.userId = :userId', { userId });
    }

    return queryBuilder.getMany();
  }

  async findAllAdmin(): Promise<Order[]> {
    return this.findAll();
  }

  async findOne(id: number, userId?: number): Promise<Order> {
    const queryBuilder = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.deliveryMethod', 'deliveryMethod')
      .leftJoinAndSelect('order.user', 'user')
      .where('order.id = :id', { id });

    if (userId) {
      queryBuilder.andWhere('order.userId = :userId', { userId });
    }

    const order = await queryBuilder.getOne();

    if (!order) {
      throw new NotFoundException(`Commande avec ID ${id} non trouvée`);
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto, userId?: number): Promise<Order> {
    const order = await this.findOne(id, userId);

    if (updateOrderDto.status) {
      order.status = updateOrderDto.status;
    }

    if (updateOrderDto.paymentStatus) {
      order.paymentStatus = updateOrderDto.paymentStatus;
    }

    if (updateOrderDto.transactionId) {
      order.transactionId = updateOrderDto.transactionId;
    }

    if (updateOrderDto.notes !== undefined) {
      order.notes = updateOrderDto.notes;
    }

    return this.ordersRepository.save(order);
  }

  async cancel(id: number, userId: number): Promise<void> {
    const order = await this.findOne(id, userId);

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('La commande est déjà annulée');
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Impossible d\'annuler une commande déjà livrée');
    }

    // Restaurer le stock
    for (const item of order.items) {
      await this.productsRepository.increment(
        { id: item.productId },
        'stockQuantity',
        item.quantity,
      );
    }

    order.status = OrderStatus.CANCELLED;
    await this.ordersRepository.save(order);
  }

  async getStatistics(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    totalProductsSold: number;
    ordersByStatus: Record<string, number>;
    revenueByMonth: Array<{ month: string; revenue: number }>;
  }> {
    const totalOrders = await this.ordersRepository.count();
    const orders = await this.ordersRepository.find({
      relations: ['items'],
    });

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);

    const pendingOrders = await this.ordersRepository.count({
      where: { status: OrderStatus.PENDING },
    });

    const totalProductsSold = orders.reduce(
      (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    );

    const ordersByStatus: Record<string, number> = {};
    for (const status of Object.values(OrderStatus)) {
      ordersByStatus[status] = await this.ordersRepository.count({ where: { status } });
    }

    // Revenus par mois (6 derniers mois)
    const revenueByMonth: Array<{ month: string; revenue: number }> = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const monthOrders = await this.ordersRepository
        .createQueryBuilder('order')
        .where('order.createdAt >= :monthStart', { monthStart })
        .andWhere('order.createdAt <= :monthEnd', { monthEnd })
        .andWhere('order.paymentStatus = :status', { status: 'paid' })
        .getMany();

      const revenue = monthOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

      revenueByMonth.push({
        month: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        revenue,
      });
    }

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      totalProductsSold,
      ordersByStatus,
      revenueByMonth,
    };
  }
}

