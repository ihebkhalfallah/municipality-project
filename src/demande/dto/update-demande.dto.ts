import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { DEMANDE_STATUS, DEMANDE_TYPE } from '../demande-status.enum';

export class UpdateDemandeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DEMANDE_TYPE)
  type?: DEMANDE_TYPE;

  @IsOptional()
  @IsEnum(DEMANDE_STATUS)
  status?: DEMANDE_STATUS;
}
