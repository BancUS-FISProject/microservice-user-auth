import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
  Get,
  Headers,
  HttpCode,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { CaptchaService } from './captcha.service';
import { ValidateTokenResponseDto } from './dto/validate-token-response.dto';
import type { Request } from 'express';

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
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
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

    const metadata = {
      timestamp: new Date().toISOString(),
      ip: this.getClientIp(req),
      device: req.headers['user-agent'] || 'desconocido',
    };

    return this.authService.login(user, metadata);
  }

  @ApiOperation({ summary: 'Validar un token JWT' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Token válido.',
    type: ValidateTokenResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token ausente, mal formado o inválido.',
  })
  @ApiForbiddenResponse({
    description: 'Token válido pero usuario inexistente.',
  })
  @Get('validate')
  async validate(@Headers('authorization') authHeader?: string) {
    const token = this.extractBearer(authHeader);
    if (!token) {
      throw new UnauthorizedException('Falta header Authorization Bearer');
    }
    const { user } = await this.authService.validateToken(token);
    return {
      status: 'ok' as const,
      email: user.email,
      iban: user.iban,
      plan: user.plan ?? 'basic',
    };
  }

  @ApiOperation({ summary: 'Logout y revocar el token JWT actual' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Token revocado' })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  @Post('logout')
  @HttpCode(204)
  async logout(@Headers('authorization') authHeader?: string) {
    const token = this.extractBearer(authHeader);
    if (!token) {
      throw new UnauthorizedException('Falta header Authorization Bearer');
    }
    const payload = await this.authService.decodeToken(token);
    const jti = payload?.jti;
    const exp = payload?.exp;
    if (!jti || !exp) {
      throw new UnauthorizedException('Token sin jti o exp');
    }
    await this.authService.revokeToken(jti, exp);
  }

  private extractBearer(authHeader?: string): string | null {
    if (!authHeader) {
      return null;
    }
    const [scheme, token] = authHeader.split(' ');
    if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
      return null;
    }
    return token;
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0].trim();
    }
    if (Array.isArray(forwarded) && forwarded.length > 0) {
      return forwarded[0];
    }
    return req.ip || '';
  }
}
