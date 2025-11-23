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
      email: 'test@example.com',
      name: 'Test User',
      password: 'password',
      phoneNumber: '+34611222333',
    };

    it('should hash password, set next id and save user', async () => {
      findOneLeanMock.mockResolvedValueOnce({ id: 2 });
      const hashed = 'hashedPassword';
      hashMock.mockResolvedValueOnce(hashed);
      const savedDoc = { id: 3, ...dto, passwordHash: hashed };
      saveMock.mockResolvedValueOnce(savedDoc);

      const result = await service.signInUser(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(mockUserModel).toHaveBeenCalledWith({
        id: 3,
        email: dto.email,
        name: dto.name,
        passwordHash: hashed,
        phoneNumber: dto.phoneNumber,
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
      findExecMock.mockResolvedValueOnce([{ id: 1 }]);

      const result = await service.getUsers();

      expect(mockUserModel.find).toHaveBeenCalledWith();
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('fetchUser', () => {
    it('should return user if found', async () => {
      findOneExecMock.mockResolvedValueOnce({ id: 1 });

      const result = await service.fetchUser(1);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual({ id: 1 });
    });

    it('should throw NotFoundException if user not found', async () => {
      findOneExecMock.mockResolvedValueOnce(null);

      await expect(service.fetchUser(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUser', () => {
    const dto = {
      email: 'test@example.com',
      name: 'Test',
      password: 'pass',
      phoneNumber: '+34611222333',
    };

    it('should update and return user', async () => {
      hashMock.mockResolvedValueOnce('hashed');
      const updated = { id: 1, ...dto, passwordHash: 'hashed' };
      findOneAndUpdateExecMock.mockResolvedValueOnce(updated);

      const result = await service.updateUser(1, dto);

      expect(hashMock).toHaveBeenCalledWith(dto.password, 10);
      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 1 },
        {
          name: dto.name,
          email: dto.email,
          passwordHash: 'hashed',
          phoneNumber: dto.phoneNumber,
        },
        { new: true, runValidators: true },
      );
      expect(result).toEqual(updated);
    });

    it('should throw BadRequestException when user does not exist', async () => {
      hashMock.mockResolvedValueOnce('hashed');
      findOneAndUpdateExecMock.mockResolvedValueOnce(null);

      await expect(service.updateUser(1, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateUser(1, dto)).rejects.toThrow(
        'Invalid update payload',
      );
    });

    it('should throw BadRequestException on duplicate key', async () => {
      hashMock.mockResolvedValueOnce('hashed');
      findOneAndUpdateExecMock.mockRejectedValueOnce({
        code: 11000,
        keyValue: { email: dto.email },
      });

      const promise = service.updateUser(1, dto);
      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow('Duplicate value for email');
    });

    it('should throw BadRequestException on invalid payload', async () => {
      hashMock.mockResolvedValueOnce('hashed');
      findOneAndUpdateExecMock.mockRejectedValueOnce(new Error('invalid'));

      await expect(service.updateUser(1, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateUser(1, dto)).rejects.toThrow(
        'Invalid update payload',
      );
    });
  });

  describe('patchUser', () => {
    it('should patch password hashing when field is passwordHash', async () => {
      hashMock.mockResolvedValueOnce('hashed');
      findOneAndUpdateExecMock.mockResolvedValueOnce({
        id: 1,
        passwordHash: 'hashed',
      });

      const result = await service.patchUser(1, {
        field: 'passwordHash',
        value: 'new',
      });

      expect(hashMock).toHaveBeenCalledWith('new', 10);
      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 1 },
        { passwordHash: 'hashed' },
        { new: true, runValidators: true },
      );
      expect(result).toEqual({ id: 1, passwordHash: 'hashed' });
    });

    it('should patch a non-password field without hashing', async () => {
      findOneAndUpdateExecMock.mockResolvedValueOnce({ id: 1, name: 'New' });

      const result = await service.patchUser(1, {
        field: 'name',
        value: 'New',
      });

      expect(hashMock).not.toHaveBeenCalled();
      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 1 },
        { name: 'New' },
        { new: true, runValidators: true },
      );
      expect(result).toEqual({ id: 1, name: 'New' });
    });

    it('should throw BadRequestException when user does not exist', async () => {
      findOneAndUpdateExecMock.mockResolvedValueOnce(null);

      await expect(
        service.patchUser(1, { field: 'name', value: 'New' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.patchUser(1, { field: 'name', value: 'New' }),
      ).rejects.toThrow('Invalid patch payload');
    });

    it('should throw BadRequestException on duplicate key', async () => {
      findOneAndUpdateExecMock.mockRejectedValueOnce({
        code: 11000,
        keyValue: { email: 'x' },
      });

      const promise = service.patchUser(1, { field: 'email', value: 'x' });
      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow('Duplicate value for email');
    });

    it('should throw BadRequestException on invalid payload', async () => {
      findOneAndUpdateExecMock.mockRejectedValueOnce(new Error('invalid'));

      await expect(
        service.patchUser(1, { field: 'email', value: 'x' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.patchUser(1, { field: 'email', value: 'x' }),
      ).rejects.toThrow('Invalid patch payload');
    });
  });

  describe('deleteUser', () => {
    it('should delete and return user', async () => {
      findOneAndDeleteExecMock.mockResolvedValueOnce({ id: 1 });

      const result = await service.deleteUser(1);

      expect(mockUserModel.findOneAndDelete).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual({ id: 1 });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      findOneAndDeleteExecMock.mockResolvedValueOnce(null);

      await expect(service.deleteUser(1)).rejects.toThrow(NotFoundException);
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
