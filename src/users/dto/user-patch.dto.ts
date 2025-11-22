import { IsIn, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserPatchDto {
  @ApiProperty({
    enum: ['name', 'passwordHash', 'phoneNumber', 'email'],
    example: 'phoneNumber',
  })
  @IsString()
  @IsIn(['name', 'passwordHash', 'phoneNumber', 'email'])
  field: 'name' | 'passwordHash' | 'phoneNumber' | 'email';

  @ApiProperty({ example: '+34666000111' })
  @IsString()
  value: string;
}
