import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { TokenBlacklistService } from './token-blacklist/token-blacklist.service';
import { NotificationsGatewayService } from './notifications-gateway.service';

describe('AuthService', () => {
  let service: AuthService;
  const usersServiceMock = {
    findByEmail: jest.fn(),
  };
  const jwtServiceMock = {
    sign: jest.fn(),
  };
  const blacklistServiceMock = {
    isRevoked: jest.fn(),
    revoke: jest.fn(),
  };
  const notificationsGatewayMock = {
    sendLoginEvent: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: TokenBlacklistService, useValue: blacklistServiceMock },
        {
          provide: NotificationsGatewayService,
          useValue: notificationsGatewayMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    notificationsGatewayMock.sendLoginEvent.mockResolvedValue(undefined);
    jwtServiceMock.sign.mockReturnValue('token');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('envía un evento de login con plan y metadata', async () => {
      const user = {
        iban: 'ES9820385778983000760236',
        email: 'user@example.com',
        plan: 'premium',
      };

      const metadata = {
        timestamp: '2026-01-03 23:05',
        device: 'Chrome',
        ip: '127.0.0.1',
      };

      await service.login(user, metadata);

      expect(notificationsGatewayMock.sendLoginEvent).toHaveBeenCalledWith(
        'ES9820385778983000760236',
        'premium',
        expect.objectContaining({
          ...metadata,
          email: 'user@example.com',
        }),
      );
    });

    it('usa plan por defecto y _id cuando falta IBAN', async () => {
      const user = {
        _id: '65fded526f31881d4e3a46b2',
        email: 'user@example.com',
      };

      await service.login(user);

      expect(notificationsGatewayMock.sendLoginEvent).toHaveBeenCalledWith(
        '65fded526f31881d4e3a46b2',
        'basic',
        expect.objectContaining({
          email: 'user@example.com',
        }),
      );
    });
  });
});
