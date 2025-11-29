import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  assignedToUserId?: number; // ID de l'utilisateur auquel le document est assigné (ex: reçu de cotisation)
}

