import {
  IsEmail,
  IsIBAN,
  IsIn,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'ES9820385778983000760236' })
  @IsIBAN()
  iban: string;

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
    example: 'basic',
    enum: ['basic', 'premium', 'business'],
    default: 'basic',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['basic', 'premium', 'business'])
  plan?: 'basic' | 'premium' | 'business';
}
