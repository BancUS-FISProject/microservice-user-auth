import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYmFuIjoiRVM5ODIwMzg1Nzc4OTgzMDAwNzYwMjM2IiwiZW1haWwiOiJqb2huQGNhdC5jb20iLCJwbGFuIjoiYmFzaWMiLCJzdWIiOiJFUzk4MjAzODU3Nzg5ODMwMDA3NjAyMzYiLCJpYXQiOjE3MDAwMDAwMDB9.signature',
  })
  access_token: string;
}
