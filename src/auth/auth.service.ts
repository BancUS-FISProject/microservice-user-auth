import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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

  async login(user: any) {
    const payload = {
      iban: user.iban,
      email: user.email,
      plan: user.plan ?? 'basic',
      sub: user.iban || user._id,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateToken(token: string) {
    const payload = await this.decodeToken(token);
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

  private async decodeToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
