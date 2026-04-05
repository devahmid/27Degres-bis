import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsEmail, IsNumber, ValidateIf } from 'class-validator';

export enum BroadcastRecipientType {
  ALL_ACTIVE = 'all_active',
  NEWSLETTER_SUBSCRIBERS = 'newsletter_subscribers',
  CUSTOM = 'custom',
  SINGLE_MEMBER = 'single_member',
}

export class SendBroadcastEmailDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(BroadcastRecipientType)
  recipientType: BroadcastRecipientType;

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  customRecipients?: string[];

  @ValidateIf(o => o.recipientType === BroadcastRecipientType.SINGLE_MEMBER)
  @IsNumber()
  @IsNotEmpty({ message: 'userId est requis pour un envoi à un seul membre' })
  userId?: number;
}
