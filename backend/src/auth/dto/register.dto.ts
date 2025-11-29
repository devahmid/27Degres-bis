import { IsEmail, IsNotEmpty, IsString, IsOptional, MinLength, IsBoolean } from 'class-validator';

export class RegisterDto {
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
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsBoolean()
  @IsOptional()
  consentAnnuaire?: boolean;

  @IsBoolean()
  @IsOptional()
  consentNewsletter?: boolean;
}

