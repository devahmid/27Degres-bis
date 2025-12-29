import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request } from '@nestjs/common';
import { SupabaseService } from '../storage/supabase.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createProductDto: CreateProductDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Si une image est uploadée, l'envoyer à Supabase
    if (file) {
      const fileName = `product-${Date.now()}-${file.originalname}`;
      const folder = 'products';

      try {
        const { url, path } = await this.supabaseService.uploadFile(
          file.buffer,
          fileName,
          folder,
        );

        createProductDto.imageUrl = url;
        createProductDto.filePath = path;
      } catch (error: any) {
        throw new Error(`Erreur lors de l'upload de l'image: ${error.message}`);
      }
    }

    return this.productsService.create(createProductDto, req.user?.id);
  }

  @Get()
  findAll() {
    return this.productsService.findAll(false);
  }

  @Get('featured')
  findFeatured() {
    return this.productsService.findFeatured();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  findAllAdmin() {
    return this.productsService.findAll(true);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Si une nouvelle image est uploadée, l'envoyer à Supabase
    if (file) {
      const fileName = `product-${Date.now()}-${file.originalname}`;
      const folder = 'products';

      try {
        const { url, path } = await this.supabaseService.uploadFile(
          file.buffer,
          fileName,
          folder,
        );

        updateProductDto.imageUrl = url;
        updateProductDto.filePath = path;
      } catch (error: any) {
        throw new Error(`Erreur lors de l'upload de l'image: ${error.message}`);
      }
    }

    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return this.productsService.updateStock(id, quantity);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}

