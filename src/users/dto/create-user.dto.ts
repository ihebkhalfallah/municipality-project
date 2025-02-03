import {
  IsEmail,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { USER_ROLE } from '../role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEnum(USER_ROLE)
  role: USER_ROLE;

  @IsNotEmpty()
  @IsISO8601()
  birthDate: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  cin: string;

  @IsOptional()
  @IsString()
  idAssociation?: string;

  @IsString()
  job: string;

  @IsOptional()
  @IsString()
  profile_photo: string;
}
