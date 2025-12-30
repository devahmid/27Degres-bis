import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { DeliveryMethod } from './entities/delivery-method.entity';
import { DeliveryMethodsService } from './delivery-methods.service';
import { DeliveryMethodsController } from './delivery-methods.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, DeliveryMethod]),
    ProductsModule,
  ],
  controllers: [OrdersController, DeliveryMethodsController],
  providers: [OrdersService, DeliveryMethodsService],
  exports: [OrdersService, DeliveryMethodsService],
})
export class OrdersModule {}

