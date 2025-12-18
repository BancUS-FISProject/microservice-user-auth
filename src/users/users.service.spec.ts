import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { BadRequestException, NotFoundException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;
  let saveMock: jest.Mock;
  let findOneLeanMock: jest.Mock;
  let findOneExecMock: jest.Mock;
  let findExecMock: jest.Mock;
  let findOneAndUpdateExecMock: jest.Mock;
  let findOneAndDeleteExecMock: jest.Mock;
  let deleteManyExecMock: jest.Mock;
  const hashMock = bcrypt.hash as jest.Mock;

  beforeEach(async () => {
    saveMock = jest.fn();
    findOneLeanMock = jest.fn().mockResolvedValue(null);
    findOneExecMock = jest.fn();
    findExecMock = jest.fn();
    findOneAndUpdateExecMock = jest.fn();
    findOneAndDeleteExecMock = jest.fn();
    deleteManyExecMock = jest.fn();

    mockUserModel = jest
      .fn()
      .mockImplementation((doc) => ({ save: saveMock, ...doc }));
    mockUserModel.findOne = jest.fn().mockImplementation(() => ({
      lean: findOneLeanMock,
      exec: findOneExecMock,
    }));
    mockUserModel.find = jest.fn().mockReturnValue({ exec: findExecMock });
    mockUserModel.findOneAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: findOneAndUpdateExecMock });
    mockUserModel.findOneAndDelete = jest
      .fn()
      .mockReturnValue({ exec: findOneAndDeleteExecMock });
    mockUserModel.deleteMany = jest
      .fn()
      .mockReturnValue({ exec: deleteManyExecMock });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signInUser', () => {
    const dto = {
      iban: 'ES9820385778983000760236',
      email: 'test@example.com',
      name: 'Test User',
      password: 'password',
      phoneNumber: '+34611222333',
    };

    it('should hash password and save user', async () => {
      const hashed = 'hashedPassword';
      hashMock.mockResolvedValueOnce(hashed);
      const savedDoc = {
        iban: dto.iban,
        ...dto,
        passwordHash: hashed,
        plan: 'basic',
      };
      saveMock.mockResolvedValueOnce(savedDoc);

      const result = await service.signInUser(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(mockUserModel).toHaveBeenCalledWith({
        iban: dto.iban,
        email: dto.email,
        name: dto.name,
        passwordHash: hashed,
        phoneNumber: dto.phoneNumber,
        plan: 'basic',
      });
      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(savedDoc);
    });

    it('should throw BadRequestException on duplicate key errors', async () => {
      hashMock.mockResolvedValueOnce('hashed');
      saveMock.mockRejectedValueOnce({
        code: 11000,
        keyValue: { email: dto.email },
      });

      const promise = service.signInUser(dto);
      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow('Duplicate value for email');
    });

    it('should propagate unexpected errors from save', async () => {
      hashMock.mockResolvedValueOnce('hashed');
      saveMock.mockRejectedValueOnce(new Error('db down'));

      await expect(service.signInUser(dto)).rejects.toThrow('db down');
    });
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      findExecMock.mockResolvedValueOnce([
        { iban: 'ES9820385778983000760236' },
      ]);

      const result = await service.getUsers();

      expect(mockUserModel.find).toHaveBeenCalledWith();
      expect(result).toEqual([{ iban: 'ES9820385778983000760236' }]);
    });
  });

  describe('fetchUser', () => {
    it('should return user if found', async () => {
      findOneExecMock.mockResolvedValueOnce({
        iban: 'ES9820385778983000760236',
      });

      const result = await service.fetchUser('ES9820385778983000760236');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        iban: 'ES9820385778983000760236',
      });
      expect(result).toEqual({ iban: 'ES9820385778983000760236' });
    });

    it('should throw NotFoundException if user not found', async () => {
      findOneExecMock.mockResolvedValueOnce(null);

      await expect(
        service.fetchUser('ES9820385778983000760236'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUser', () => {
    const dto = {
      iban: 'ES9820385778983000760236',
      email: 'test@example.com',
      name: 'Test',
      password: 'pass',
      phoneNumber: '+34611222333',
    };

    it('should update and return user', async () => {
      hashMock.mockResolvedValueOnce('hashed');
      const updated = {
        iban: dto.iban,
        ...dto,
        passwordHash: 'hashed',
        plan: 'basic',
      };
      findOneAndUpdateExecMock.mockResolvedValueOnce(updated);

      const result = await service.updateUser(dto.iban, dto);

      expect(hashMock).toHaveBeenCalledWith(dto.password, 10);
      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { iban: dto.iban },
        {
          name: dto.name,
          email: dto.email,
          passwordHash: 'hashed',
          phoneNumber: dto.phoneNumber,
          plan: 'basic',
        },
        { new: true, runValidators: true },
      );
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      hashMock.mockResolvedValueOnce('hashed');
      findOneAndUpdateExecMock.mockResolvedValueOnce(null);

      await expect(service.updateUser(dto.iban, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException on duplicate key', async () => {
      hashMock.mockResolvedValueOnce('hashed');
      findOneAndUpdateExecMock.mockRejectedValueOnce({
        code: 11000,
        keyValue: { email: dto.email },
      });

      const promise = service.updateUser(dto.iban, dto);
      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow('Duplicate value for email');
    });

    it('should throw BadRequestException on invalid payload', async () => {
      hashMock.mockResolvedValueOnce('hashed');
      findOneAndUpdateExecMock.mockRejectedValueOnce(new Error('invalid'));

      const promise = service.updateUser(dto.iban, dto);
      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow('Invalid update payload');
    });
  });

  describe('patchUser', () => {
    it('should patch password hashing when field is passwordHash', async () => {
      hashMock.mockResolvedValueOnce('hashed');
      findOneAndUpdateExecMock.mockResolvedValueOnce({
        iban: 'ES9820385778983000760236',
        passwordHash: 'hashed',
      });

      const result = await service.patchUser('ES9820385778983000760236', {
        field: 'passwordHash',
        value: 'new',
      });

      expect(hashMock).toHaveBeenCalledWith('new', 10);
      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { iban: 'ES9820385778983000760236' },
        { passwordHash: 'hashed' },
        { new: true, runValidators: true },
      );
      expect(result).toEqual({
        iban: 'ES9820385778983000760236',
        passwordHash: 'hashed',
      });
    });

    it('should patch a non-password field without hashing', async () => {
      findOneAndUpdateExecMock.mockResolvedValueOnce({
        iban: 'ES9820385778983000760236',
        name: 'New',
      });

      const result = await service.patchUser('ES9820385778983000760236', {
        field: 'name',
        value: 'New',
      });

      expect(hashMock).not.toHaveBeenCalled();
      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { iban: 'ES9820385778983000760236' },
        { name: 'New' },
        { new: true, runValidators: true },
      );
      expect(result).toEqual({
        iban: 'ES9820385778983000760236',
        name: 'New',
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      findOneAndUpdateExecMock.mockResolvedValueOnce(null);

      await expect(
        service.patchUser('ES9820385778983000760236', {
          field: 'name',
          value: 'New',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on duplicate key', async () => {
      findOneAndUpdateExecMock.mockRejectedValueOnce({
        code: 11000,
        keyValue: { email: 'x' },
      });

      const promise = service.patchUser('ES9820385778983000760236', {
        field: 'email',
        value: 'x',
      });
      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow('Duplicate value for email');
    });

    it('should throw BadRequestException on invalid payload', async () => {
      findOneAndUpdateExecMock.mockRejectedValueOnce(new Error('invalid'));

      const promise = service.patchUser('ES9820385778983000760236', {
        field: 'email',
        value: 'x',
      });
      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow('Invalid patch payload');
    });
  });

  describe('deleteUser', () => {
    it('should delete and return user', async () => {
      findOneAndDeleteExecMock.mockResolvedValueOnce({
        iban: 'ES9820385778983000760236',
      });

      const result = await service.deleteUser('ES9820385778983000760236');

      expect(mockUserModel.findOneAndDelete).toHaveBeenCalledWith({
        iban: 'ES9820385778983000760236',
      });
      expect(result).toEqual({ iban: 'ES9820385778983000760236' });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      findOneAndDeleteExecMock.mockResolvedValueOnce(null);

      await expect(
        service.deleteUser('ES9820385778983000760236'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAllUsers', () => {
    it('should delete all users', async () => {
      deleteManyExecMock.mockResolvedValueOnce({
        acknowledged: true,
        deletedCount: 3,
      });

      const result = await service.deleteAllUsers();

      expect(mockUserModel.deleteMany).toHaveBeenCalledWith({});
      expect(result).toEqual({ acknowledged: true, deletedCount: 3 });
    });
  });
});
