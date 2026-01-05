import {
  IsEmail,
  IsIn,
  IsIBAN,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'ES9820385778983000760236',
    description: 'IBAN proporcionado por el microservicio de cuentas',
  })
  @IsOptional()
  @IsIBAN()
  iban?: string;

  @ApiProperty({ example: 'marmedsan@bancus.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Mario Medina Santos' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: '123456', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string; // si quieres meterla ya, si no, quítala

  @ApiProperty({ example: '+34611222333', minLength: 6 })
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({
    example: 'basico',
    enum: ['basico', 'premium', 'pro'],
    default: 'basico',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['basico', 'premium', 'pro'])
  plan?: 'basico' | 'premium' | 'pro';
}
