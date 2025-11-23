import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserPatchDto } from './dto/user-patch.dto';

describe('UsersController', () => {
  let controller: UsersController;
  const mockUsersService = {
    signInUser: jest.fn(),
    fetchUser: jest.fn(),
    updateUser: jest.fn(),
    patchUser: jest.fn(),
    deleteUser: jest.fn(),
    deleteAllUsers: jest.fn(),
    getUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signInUser', () => {
    it('should call usersService.signInUser with correct parameters', async () => {
      const dto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        phoneNumber: '+34611222333',
      };
      await controller.signInUser(dto);
      expect(mockUsersService.signInUser).toHaveBeenCalledWith(dto);
    });

    it('should return the result from usersService.signInUser', async () => {
      const dto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        phoneNumber: '+34611222333',
      };
      mockUsersService.signInUser.mockResolvedValueOnce({ id: '1', ...dto });
      const result = await controller.signInUser(dto);
      expect(result).toEqual({ id: '1', ...dto });
    });

    it('should propagate errors from usersService.signInUser', async () => {
      const dto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        phoneNumber: '+34611222333',
      };
      mockUsersService.signInUser.mockRejectedValueOnce(new Error('Error'));
      await expect(controller.signInUser(dto)).rejects.toThrow('Error');
    });
  });

  describe('fetchUser', () => {
    it('should call usersService.fetchUser with id', async () => {
      mockUsersService.fetchUser.mockResolvedValueOnce({ id: 1 });
      await controller.fetchUser(1);
      expect(mockUsersService.fetchUser).toHaveBeenCalledWith(1);
    });

    it('should return the result from usersService.fetchUser', async () => {
      mockUsersService.fetchUser.mockResolvedValueOnce({ id: 1, name: 'Test' });
      const result = await controller.fetchUser(1);
      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    it('should propagate errors from usersService.fetchUser', async () => {
      mockUsersService.fetchUser.mockRejectedValueOnce(new Error('Not found'));
      await expect(controller.fetchUser(1)).rejects.toThrow('Not found');
    });
  });

  describe('updateUser', () => {
    const dto = {
      email: 'test@example.com',
      name: 'Test',
      password: 'pass',
      phoneNumber: '+34611222333',
    };

    it('should call usersService.updateUser with id and dto', async () => {
      mockUsersService.updateUser.mockResolvedValueOnce({ id: 1, ...dto });
      await controller.updateUser(1, dto);
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(1, dto);
    });

    it('should return the result from usersService.updateUser', async () => {
      mockUsersService.updateUser.mockResolvedValueOnce({ id: 1, ...dto });
      const result = await controller.updateUser(1, dto);
      expect(result).toEqual({ id: 1, ...dto });
    });

    it('should propagate errors from usersService.updateUser', async () => {
      mockUsersService.updateUser.mockRejectedValueOnce(new Error('Error'));
      await expect(controller.updateUser(1, dto)).rejects.toThrow('Error');
    });
  });

  describe('patchUser', () => {
    const patchDto: UserPatchDto = { field: 'name', value: 'New Name' };

    it('should call usersService.patchUser with id and patch dto', async () => {
      mockUsersService.patchUser.mockResolvedValueOnce({
        id: 1,
        name: 'New Name',
      });
      await controller.patchUser(1, patchDto);
      expect(mockUsersService.patchUser).toHaveBeenCalledWith(1, patchDto);
    });

    it('should return the result from usersService.patchUser', async () => {
      mockUsersService.patchUser.mockResolvedValueOnce({
        id: 1,
        name: 'New Name',
      });
      const result = await controller.patchUser(1, patchDto);
      expect(result).toEqual({ id: 1, name: 'New Name' });
    });

    it('should propagate errors from usersService.patchUser', async () => {
      mockUsersService.patchUser.mockRejectedValueOnce(new Error('Error'));
      await expect(controller.patchUser(1, patchDto)).rejects.toThrow('Error');
    });
  });

  describe('deleteUser', () => {
    it('should call usersService.deleteUser with id', async () => {
      await controller.deleteUser(1);
      expect(mockUsersService.deleteUser).toHaveBeenCalledWith(1);
    });

    it('should resolve when usersService.deleteUser succeeds', async () => {
      await expect(controller.deleteUser(1)).resolves.toBeUndefined();
    });

    it('should propagate errors from usersService.deleteUser', async () => {
      mockUsersService.deleteUser.mockRejectedValueOnce(new Error('Error'));
      await expect(controller.deleteUser(1)).rejects.toThrow('Error');
    });
  });

  describe('deleteAllUsers', () => {
    it('should call usersService.deleteAllUsers', async () => {
      await controller.deleteAllUsers();
      expect(mockUsersService.deleteAllUsers).toHaveBeenCalled();
    });

    it('should resolve when usersService.deleteAllUsers succeeds', async () => {
      await expect(controller.deleteAllUsers()).resolves.toBeUndefined();
    });

    it('should propagate errors from usersService.deleteAllUsers', async () => {
      mockUsersService.deleteAllUsers.mockRejectedValueOnce(new Error('Error'));
      await expect(controller.deleteAllUsers()).rejects.toThrow('Error');
    });
  });

  describe('findAll', () => {
    it('should call usersService.getUsers', async () => {
      await controller.findAll();
      expect(mockUsersService.getUsers).toHaveBeenCalled();
    });

    it('should return the result from usersService.getUsers', async () => {
      mockUsersService.getUsers.mockResolvedValueOnce([{ id: 1 }]);
      const result = await controller.findAll();
      expect(result).toEqual([{ id: 1 }]);
    });

    it('should propagate errors from usersService.getUsers', async () => {
      mockUsersService.getUsers.mockRejectedValueOnce(new Error('Error'));
      await expect(controller.findAll()).rejects.toThrow('Error');
    });
  });
});
