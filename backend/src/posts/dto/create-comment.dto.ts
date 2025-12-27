import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  content: string;
}









