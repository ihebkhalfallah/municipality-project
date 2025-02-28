import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { EVENT_STATUS, EVENT_TYPE } from '../event.enum';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  photo?: string;

  @IsOptional()
  @IsISO8601()
  date?: Date;

  @IsOptional()
  @IsEnum(EVENT_TYPE)
  type?: EVENT_TYPE;

  @IsOptional()
  @IsEnum(EVENT_STATUS)
  status?: EVENT_STATUS;
}
