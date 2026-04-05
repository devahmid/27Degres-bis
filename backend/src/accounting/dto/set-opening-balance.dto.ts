import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class SetOpeningBalanceDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
