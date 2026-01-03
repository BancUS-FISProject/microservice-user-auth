import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { TokenBlacklistService } from './token-blacklist/token-blacklist.service';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: TokenBlacklistService, useValue: blacklistServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
