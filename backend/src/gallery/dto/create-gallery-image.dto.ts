import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateGalleryImageDto {
  @IsString()
  @IsOptional()
  caption?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsString()
  @IsOptional()
  category?: string;
}
