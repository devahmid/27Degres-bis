import { IsNumber, IsNotEmpty, IsOptional, IsEnum, IsString } from 'class-validator';

export class CreateCotisationDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  year: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(['paid', 'pending', 'overdue'])
  @IsOptional()
  status?: 'paid' | 'pending' | 'overdue';

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  transactionId?: string;
}

