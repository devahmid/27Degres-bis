import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';

export class CreateIdeaDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(['activity', 'project', 'improvement', 'event'])
  @IsOptional()
  category?: 'activity' | 'project' | 'improvement' | 'event';

  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedBudget?: number;
}
