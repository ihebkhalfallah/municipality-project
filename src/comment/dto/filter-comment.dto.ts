import { IsOptional, IsInt, IsString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllCommentsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  eventId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  demandeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  authorizationId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;
}