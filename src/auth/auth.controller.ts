import { Controller, Post, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { CaptchaService } from './captcha.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly captchaService: CaptchaService,
  ) {}

  @ApiOperation({ summary: 'Login user and return JWT Token' })
  @ApiOkResponse({
    description: 'Login exitoso, devuelve el token.',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas.' })
  @ApiBadRequestResponse({ description: 'Captcha inválido o no verificado.' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const captchaOk = await this.captchaService.verify(loginDto.captchaToken);
    if (!captchaOk) {
      throw new BadRequestException('Captcha inválido o no verificado');
    }

    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.authService.login(user);
  }
}
