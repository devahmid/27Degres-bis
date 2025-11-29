import { IsEmail, IsNotEmpty, IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

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
  consentAnnuaire?: boolean;

  @IsBoolean()
  @IsOptional()
  consentNewsletter?: boolean;
}

