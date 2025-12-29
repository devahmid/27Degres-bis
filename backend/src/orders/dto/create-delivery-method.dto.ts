import { IsString, IsNumber, IsOptional, Min, IsBoolean } from 'class-validator';

export class CreateDeliveryMethodDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  cost: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  estimatedDays?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

