import { ApiProperty } from '@nestjs/swagger';

export class ValidateTokenResponseDto {
  @ApiProperty({ example: 'ok' })
  status: 'ok';

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'ES1234567890123456789012' })
  iban: string;

  @ApiProperty({
    example: 'basic',
    enum: ['basic', 'premium', 'business'],
  })
  plan: 'basic' | 'premium' | 'business';
}
