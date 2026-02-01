import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsEmail } from 'class-validator';

export enum BroadcastRecipientType {
  ALL_ACTIVE = 'all_active',
  NEWSLETTER_SUBSCRIBERS = 'newsletter_subscribers',
  CUSTOM = 'custom',
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
}
