import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';
import { PASSWORD_INVALID } from 'src/helper/message';
import { ROLE } from 'src/helper/role.enum';

export class CreateUserDto {
    @ApiProperty({ example: "Dipang" })
    @IsNotEmpty()
    first_name: string;

    @ApiProperty({ example: "Bhadrecha" })
    @IsNotEmpty()
    last_name: string;

    @ApiProperty({ example: "1234567890" })
    @IsNotEmpty()
    phone: number;

    @ApiProperty({ example: "xyz@gmail.com" })  
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: "********" })
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(12)
    @Matches(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{8,12}$/, {
        message: PASSWORD_INVALID
    })
    password: string;

    @ApiProperty({ example: "true" })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;

    @IsString()
    @IsOptional()
    role?: ROLE;
}
