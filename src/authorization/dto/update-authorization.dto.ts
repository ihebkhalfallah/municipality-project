import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DEMANDE_STATUS } from 'src/demande/demande-status.enum';

export class UpdateAuthorizationDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  location?: string;

  @IsOptional()
  @IsEnum(DEMANDE_STATUS)
  status?: DEMANDE_STATUS;
}
