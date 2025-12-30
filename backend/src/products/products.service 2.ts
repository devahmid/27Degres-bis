import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, userId?: number): Promise<Product> {
    const product = this.productsRepository.create({
      ...createProductDto,
      createdBy: userId,
      stockQuantity: createProductDto.stockQuantity ?? 0,
      status: createProductDto.status || 'active',
      isFeatured: createProductDto.isFeatured || false,
    });
    return this.productsRepository.save(product);
  }

  async findAll(includeInactive = false): Promise<Product[]> {
    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.creator', 'creator')
      .orderBy('product.createdAt', 'DESC');

    if (!includeInactive) {
      queryBuilder.where('product.status = :status', { status: 'active' });
    }

    return queryBuilder.getMany();
  }

  async findFeatured(): Promise<Product[]> {
    return this.productsRepository.find({
      where: { isFeatured: true, status: 'active' },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    await this.productsRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  async updateStock(id: number, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    product.stockQuantity = quantity;
    
    // Mettre à jour le statut si le stock est à zéro
    if (quantity === 0) {
      product.status = 'sold_out';
    } else if (product.status === 'sold_out') {
      product.status = 'active';
    }
    
    return this.productsRepository.save(product);
  }
}

