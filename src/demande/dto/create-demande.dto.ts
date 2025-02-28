import { Optional } from '@nestjs/common';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DEMANDE_TYPE } from '../demande-status.enum';

export class CreateDemandeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  location: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(DEMANDE_TYPE)
  type: DEMANDE_TYPE;
}
