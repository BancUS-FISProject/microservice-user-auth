import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: 'ES9820385778983000760236',
    description: 'User IBAN',
  })
  iban: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: '+34123456789' })
  phoneNumber: string;

  @ApiProperty({
    example: 'premium',
    enum: ['basic', 'premium', 'business'],
    description: 'Pricing plan assigned to the user',
  })
  plan: 'basic' | 'premium' | 'business';
}
