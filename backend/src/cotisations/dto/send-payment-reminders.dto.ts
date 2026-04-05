import { IsArray, IsInt, IsOptional, ArrayMinSize } from 'class-validator';

export class SendPaymentRemindersDto {
  @IsOptional()
  @IsInt()
  year?: number;

  /** Si fourni, envoie uniquement pour ces cotisations (sinon tous les non payés de l'année) */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  cotisationIds?: number[];
}
