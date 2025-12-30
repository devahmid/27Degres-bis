import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, IsEmail, IsBoolean, IsEnum, IsDateString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(['admin', 'bureau', 'membre', 'visiteur'])
  @IsOptional()
  role?: 'admin' | 'bureau' | 'membre' | 'visiteur';

  @IsString()
  @IsOptional()
  addressStreet?: string;

  @IsString()
  @IsOptional()
  addressCity?: string;

  @IsString()
  @IsOptional()
  addressPostalCode?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  consentAnnuaire?: boolean;

  @IsBoolean()
  @IsOptional()
  consentNewsletter?: boolean;

  @IsString()
  @IsOptional()
  passwordResetToken?: string;

  @IsDateString()
  @IsOptional()
  passwordResetExpires?: Date;
}

