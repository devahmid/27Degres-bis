import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';

export class UpdateIdeaDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['activity', 'project', 'improvement', 'event'])
  @IsOptional()
  category?: 'activity' | 'project' | 'improvement' | 'event';

  @IsEnum(['idea', 'discussion', 'validated', 'in_progress', 'completed', 'archived'])
  @IsOptional()
  status?: 'idea' | 'discussion' | 'validated' | 'in_progress' | 'completed' | 'archived';

  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedBudget?: number;
}
