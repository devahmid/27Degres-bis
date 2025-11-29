import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateGalleryImageDto } from './create-gallery-image.dto';

export class UpdateGalleryImageDto extends PartialType(CreateGalleryImageDto) {
  @IsString()
  @IsOptional()
  caption?: string;

  @Transform(({ value }) => {
    if (value === 'true' || value === '1' || value === true || value === 1) {
      return true;
    }
    if (value === 'false' || value === '0' || value === false || value === 0) {
      return false;
    }
    return value;
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsString()
  @IsOptional()
  category?: string;
}
