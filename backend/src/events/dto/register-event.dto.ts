import { IsOptional, IsBoolean, IsString, IsEnum, IsArray } from 'class-validator';

export class RegisterEventDto {
  @IsEnum(['full', 'partial'])
  @IsOptional()
  availabilityType?: 'full' | 'partial';

  @IsString()
  @IsOptional()
  availabilityDetails?: string;

  @IsBoolean()
  @IsOptional()
  isVolunteer?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  volunteerActivities?: string[];

  @IsString()
  @IsOptional()
  notes?: string;
}
