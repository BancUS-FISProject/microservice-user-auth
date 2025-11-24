import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AY2F0LmNvbSIsInN1YiI6MSwiaWF0IjoxNzAwMDAwMDB9.mOCKtnAc3wF6FIInafjX3Npph8CBtaXG3pLE2akgP-A',
  })
  access_token: string;
}
