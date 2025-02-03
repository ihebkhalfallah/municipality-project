import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  previousPassword: string;

  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  birthDate: Date;

  @IsOptional()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  job: string;

  @IsOptional()
  @IsString()
  profile_photo: string;

  @IsOptional()
  @IsBoolean()
  locked: boolean;
}
