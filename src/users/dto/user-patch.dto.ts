import {
  IsEmail,
  IsIn,
  IsPhoneNumber,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserPatchDto {
  @ApiProperty({
    enum: ['name', 'passwordHash', 'phoneNumber', 'email'],
    example: 'phoneNumber',
  })
  @IsString()
  @IsIn(['name', 'passwordHash', 'phoneNumber', 'email'])
  field: 'name' | 'passwordHash' | 'phoneNumber' | 'email';

  @ApiProperty({
    example: '+34666000111',
    description:
      'Nuevo valor para el campo indicado. Se validan formato y longitud según el campo.',
  })
  @IsString()
  @ValidateIf((o: UserPatchDto) => o.field === 'email')
  @IsEmail()
  @ValidateIf((o: UserPatchDto) => o.field === 'phoneNumber')
  @IsPhoneNumber()
  @ValidateIf((o: UserPatchDto) => o.field === 'passwordHash')
  @MinLength(6)
  @ValidateIf((o: UserPatchDto) => o.field === 'name')
  @MinLength(3)
  value: string;
}
