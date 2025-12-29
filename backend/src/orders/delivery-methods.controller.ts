import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { DeliveryMethodsService } from './delivery-methods.service';
import { CreateDeliveryMethodDto } from './dto/create-delivery-method.dto';
import { UpdateDeliveryMethodDto } from './dto/update-delivery-method.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('delivery-methods')
export class DeliveryMethodsController {
  constructor(private readonly deliveryMethodsService: DeliveryMethodsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  create(@Body() createDeliveryMethodDto: CreateDeliveryMethodDto) {
    return this.deliveryMethodsService.create(createDeliveryMethodDto);
  }

  @Public()
  @Get('active')
  findActive() {
    return this.deliveryMethodsService.findActive();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  findAll() {
    return this.deliveryMethodsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.deliveryMethodsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeliveryMethodDto: UpdateDeliveryMethodDto,
  ) {
    return this.deliveryMethodsService.update(id, updateDeliveryMethodDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.deliveryMethodsService.remove(id);
  }
}

