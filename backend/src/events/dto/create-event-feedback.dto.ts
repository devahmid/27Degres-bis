import {
  IsInt,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  MinLength,
} from 'class-validator';

export class CreateEventFeedbackDto {
  @IsInt()
  @Min(1)
  @Max(5)
  overallRating: number;

  @IsInt()
  @Min(1)
  @Max(5)
  organizationRating: number;

  @IsInt()
  @Min(1)
  @Max(5)
  atmosphereRating: number;

  @IsInt()
  @Min(1)
  @Max(5)
  communityImpactRating: number;

  @IsString()
  @IsOptional()
  highlights?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  improvements: string;

  @IsBoolean()
  wouldRecommend: boolean;

  @IsString()
  @IsOptional()
  additionalComments?: string;
}
