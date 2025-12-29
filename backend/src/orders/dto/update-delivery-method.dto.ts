import { PartialType } from '@nestjs/mapped-types';
import { CreateDeliveryMethodDto } from './create-delivery-method.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateDeliveryMethodDto extends PartialType(CreateDeliveryMethodDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

