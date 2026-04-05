import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateEventCarpoolDto {
  @IsEnum(['offer', 'seek'])
  kind: 'offer' | 'seek';

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  departureArea: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  seatsOffered?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
