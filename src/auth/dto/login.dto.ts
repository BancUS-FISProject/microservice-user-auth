import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'marmedsan@bancus.com',
    description: 'El correo electrónico del usuario',
  })
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @ApiProperty({
    example: '123456',
    minLength: 6,
    description: 'La contraseña del usuario',
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({
    example: '03AFcWeA6R2...',
    description: 'Token devuelto por el proveedor de captcha (hCaptcha/reCAPTCHA).',
  })
  @IsString()
  @IsNotEmpty({ message: 'El token de captcha es obligatorio' })
  captchaToken: string;
}
