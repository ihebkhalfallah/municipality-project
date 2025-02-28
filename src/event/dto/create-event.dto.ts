import { IsEnum, IsISO8601, IsNotEmpty, IsString } from 'class-validator';
import { EVENT_TYPE } from '../event.enum';
import { Optional } from '@nestjs/common';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @Optional()
  location: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsISO8601()
  date: Date;

  @IsNotEmpty()
  @IsEnum(EVENT_TYPE)
  type: EVENT_TYPE;
}
