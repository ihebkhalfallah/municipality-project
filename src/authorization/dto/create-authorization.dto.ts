import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAuthrizationDto{
    @IsNotEmpty()
    @IsString()
    name : string;

    @IsOptional()
    description: string;

    @IsOptional()
    location: string;
    
    @IsOptional()
    start_date: Date;
    
    @IsOptional()
    end_date: Date;
}