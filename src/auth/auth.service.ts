import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { TokenBlacklistService } from './token-blacklist/token-blacklist.service';
import { NotificationsGatewayService } from './notifications-gateway.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly tokenBlacklist: TokenBlacklistService,
    private readonly notificationsGateway: NotificationsGatewayService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (user && (await bcrypt.compare(pass, user.passwordHash))) {
        const { passwordHash, ...result } = user.toObject
          ? user.toObject()
          : user;
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async login(user: any, metadata: Record<string, unknown> = {}) {
    const jti = randomUUID();
    const plan = user.plan ?? 'basic';
    const payload = {
      iban: user.iban,
      email: user.email,
      plan,
      sub: user.iban || user._id,
      jti,
    };
    const userId = user.iban ?? user._id?.toString?.() ?? user._id;
    if (userId) {
      await this.notificationsGateway.sendLoginEvent(
        userId,
        plan,
        {
          ...metadata,
          email: user.email,
        },
      );
    }
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateToken(token: string) {
    const payload = await this.decodeToken(token);
    if (!payload?.jti) {
      throw new UnauthorizedException('Token sin identificador (jti)');
    }

    const revoked = await this.tokenBlacklist.isRevoked(payload.jti);
    if (revoked) {
      throw new UnauthorizedException('Token revocado');
    }

    const email = payload?.email;
    if (!email) {
      throw new ForbiddenException('Token sin email');
    }

    try {
      const user = await this.usersService.findByEmail(email);
      const { passwordHash, ...safeUser } = user.toObject
        ? user.toObject()
        : user;
      return { payload, user: safeUser };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new ForbiddenException('Usuario no encontrado');
      }
      throw error;
    }
  }

  async decodeToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  async revokeToken(jti: string, expSeconds: number): Promise<void> {
    if (!jti || !expSeconds) {
      throw new UnauthorizedException('Token incompleto para revocar');
    }
    const nowSeconds = Math.floor(Date.now() / 1000);
    const ttlSeconds = Math.max(expSeconds - nowSeconds, 0);
    const expiresAt =
      ttlSeconds > 0
        ? new Date((nowSeconds + ttlSeconds) * 1000)
        : new Date(expSeconds * 1000);
    await this.tokenBlacklist.revoke(jti, expiresAt);
  }
}
