import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        example: 'admin@peykermoda.com',
        description: 'Kullanıcı email adresi',
    })
    @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
    @IsNotEmpty({ message: 'Email adresi zorunludur' })
    email: string;

    @ApiProperty({
        example: 'password123',
        description: 'Kullanıcı şifresi',
    })
    @IsString()
    @IsNotEmpty({ message: 'Şifre zorunludur' })
    @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
    password: string;
}
