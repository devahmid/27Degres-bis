import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['weekend', 'reunion', 'activite'])
  @IsOptional()
  type?: 'weekend' | 'reunion' | 'activite';

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @IsOptional()
  maxParticipants?: number;

  @IsString()
  @IsOptional()
  featuredImage?: string;

  @IsEnum(['draft', 'published', 'cancelled'])
  @IsOptional()
  status?: 'draft' | 'published' | 'cancelled';

  @IsNumber()
  @IsOptional()
  createdBy?: number;
}









