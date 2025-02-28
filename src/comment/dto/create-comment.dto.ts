import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  commentText: string;

  @IsOptional()
  @IsInt()
  eventId?: number;

  @IsOptional()
  @IsInt()
  demandeId?: number;

  @IsOptional()
  @IsInt()
  authorizationId?: number;
}
