import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryMethod } from './entities/delivery-method.entity';
import { CreateDeliveryMethodDto } from './dto/create-delivery-method.dto';
import { UpdateDeliveryMethodDto } from './dto/update-delivery-method.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class DeliveryMethodsService {
  constructor(
    @InjectRepository(DeliveryMethod)
    private deliveryMethodsRepository: Repository<DeliveryMethod>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async create(createDeliveryMethodDto: CreateDeliveryMethodDto): Promise<DeliveryMethod> {
    const deliveryMethod = this.deliveryMethodsRepository.create(createDeliveryMethodDto);
    return this.deliveryMethodsRepository.save(deliveryMethod);
  }

  async findAll(): Promise<DeliveryMethod[]> {
    return this.deliveryMethodsRepository.find({
      order: { cost: 'ASC' },
    });
  }

  async findActive(): Promise<DeliveryMethod[]> {
    return this.deliveryMethodsRepository.find({
      where: { isActive: true },
      order: { cost: 'ASC' },
    });
  }

  async findOne(id: number): Promise<DeliveryMethod> {
    const deliveryMethod = await this.deliveryMethodsRepository.findOne({
      where: { id },
    });

    if (!deliveryMethod) {
      throw new NotFoundException(`Méthode de livraison avec ID ${id} non trouvée`);
    }

    return deliveryMethod;
  }

  async update(id: number, updateDeliveryMethodDto: UpdateDeliveryMethodDto): Promise<DeliveryMethod> {
    const deliveryMethod = await this.findOne(id);

    Object.assign(deliveryMethod, updateDeliveryMethodDto);

    return this.deliveryMethodsRepository.save(deliveryMethod);
  }

  async remove(id: number): Promise<void> {
    const deliveryMethod = await this.findOne(id);
    
    // Vérifier si des commandes utilisent cette méthode de livraison
    const ordersCount = await this.ordersRepository.count({
      where: { deliveryMethodId: id }
    });
    
    if (ordersCount > 0) {
      throw new BadRequestException(
        `Impossible de supprimer cette méthode de livraison car elle est utilisée par ${ordersCount} commande(s). ` +
        `Désactivez-la plutôt que de la supprimer.`
      );
    }
    
    await this.deliveryMethodsRepository.remove(deliveryMethod);
  }
}

