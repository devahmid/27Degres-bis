import { IsString, IsNumber, IsOptional, IsBoolean, Min, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  filePath?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @IsString()
  @IsOptional()
  status?: 'active' | 'inactive' | 'sold_out';

  @IsString()
  @IsOptional()
  category?: string;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

