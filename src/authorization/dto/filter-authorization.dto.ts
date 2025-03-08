import { IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';
import { AUTHORIZATION_STATUS } from '../authorization-status.enum';
import { USER_ROLE } from 'src/users/role.enum';
import { Type } from 'class-transformer';

export class FindAuthorizationDto {
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
  sortBy?: string = 'id';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  status?: AUTHORIZATION_STATUS;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  createdByUserId?: number;

  @IsOptional()
  @IsEnum(USER_ROLE)
  userRole?: USER_ROLE;

  @IsOptional()
  @Type(() => Date)
  start_date?: Date;

  @IsOptional()
  @Type(() => Date)
  end_date?: Date;

  @IsOptional()
  @Type(() => Date)
  creation_date?: Date;
}
