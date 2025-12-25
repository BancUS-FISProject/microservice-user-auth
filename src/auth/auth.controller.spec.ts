import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CaptchaService } from './captcha.service';

describe('AuthController', () => {
  let controller: AuthController;
  const usersServiceMock = {
    findByEmail: jest.fn(),
  };
  const jwtServiceMock = {
    sign: jest.fn(),
  };
  const authServiceMock = {
    validateUser: jest.fn(),
    login: jest.fn(),
  };
  const captchaServiceMock = {
    verify: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: CaptchaService, useValue: captchaServiceMock },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
