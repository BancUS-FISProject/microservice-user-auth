import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserPatchDto } from './dto/user-patch.dto';

describe('UsersController', () => {
  let controller: UsersController;
  const mockUsersService = {
    signInUser: jest.fn(),
    fetchUser: jest.fn(),
    findByEmail: jest.fn(),
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
        iban: 'ES9820385778983000760236',
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
        iban: 'ES9820385778983000760236',
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        phoneNumber: '+34611222333',
      };
      mockUsersService.signInUser.mockResolvedValueOnce({
        iban: dto.iban,
        ...dto,
      });
      const result = await controller.signInUser(dto);
      expect(result).toEqual({ iban: dto.iban, ...dto });
    });

    it('should propagate errors from usersService.signInUser', async () => {
      const dto = {
        iban: 'ES9820385778983000760236',
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
    it('should call usersService.fetchUser when identifier looks like an iban', async () => {
      mockUsersService.fetchUser.mockResolvedValueOnce({
        iban: 'ES9820385778983000760236',
      });
      await controller.fetchUser('ES9820385778983000760236');
      expect(mockUsersService.fetchUser).toHaveBeenCalledWith(
        'ES9820385778983000760236',
      );
      expect(mockUsersService.findByEmail).not.toHaveBeenCalled();
    });

    it('should return the result from usersService.fetchUser', async () => {
      mockUsersService.fetchUser.mockResolvedValueOnce({
        iban: 'ES9820385778983000760236',
        name: 'Test',
      });
      const result = await controller.fetchUser('ES9820385778983000760236');
      expect(result).toEqual({
        iban: 'ES9820385778983000760236',
        name: 'Test',
      });
    });

    it('should call usersService.findByEmail when identifier contains @', async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce({
        email: 'john@example.com',
        iban: 'ES9820385778983000760236',
      });
      await controller.fetchUser('john@example.com');
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'john@example.com',
      );
      expect(mockUsersService.fetchUser).not.toHaveBeenCalled();
    });

    it('should propagate errors from usersService.fetchUser or findByEmail', async () => {
      mockUsersService.fetchUser.mockRejectedValueOnce(new Error('Not found'));
      await expect(
        controller.fetchUser('ES9820385778983000760236'),
      ).rejects.toThrow('Not found');
      mockUsersService.fetchUser.mockReset();
      mockUsersService.findByEmail.mockRejectedValueOnce(
        new Error('Not found'),
      );
      await expect(controller.fetchUser('john@example.com')).rejects.toThrow(
        'Not found',
      );
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

    it('should call usersService.updateUser with iban and dto', async () => {
      mockUsersService.updateUser.mockResolvedValueOnce({
        iban: dto.iban,
        ...dto,
      });
      await controller.updateUser(dto.iban, dto);
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(dto.iban, dto);
    });

    it('should return the result from usersService.updateUser', async () => {
      mockUsersService.updateUser.mockResolvedValueOnce({
        iban: dto.iban,
        ...dto,
      });
      const result = await controller.updateUser(dto.iban, dto);
      expect(result).toEqual({ iban: dto.iban, ...dto });
    });

    it('should propagate errors from usersService.updateUser', async () => {
      mockUsersService.updateUser.mockRejectedValueOnce(new Error('Error'));
      await expect(controller.updateUser(dto.iban, dto)).rejects.toThrow(
        'Error',
      );
    });
  });

  describe('patchUser', () => {
    const patchDto: UserPatchDto = { field: 'name', value: 'New Name' };

    it('should call usersService.patchUser with iban and patch dto', async () => {
      mockUsersService.patchUser.mockResolvedValueOnce({
        iban: 'ES9820385778983000760236',
        name: 'New Name',
      });
      await controller.patchUser('ES9820385778983000760236', patchDto);
      expect(mockUsersService.patchUser).toHaveBeenCalledWith(
        'ES9820385778983000760236',
        patchDto,
      );
    });

    it('should return the result from usersService.patchUser', async () => {
      mockUsersService.patchUser.mockResolvedValueOnce({
        iban: 'ES9820385778983000760236',
        name: 'New Name',
      });
      const result = await controller.patchUser(
        'ES9820385778983000760236',
        patchDto,
      );
      expect(result).toEqual({
        iban: 'ES9820385778983000760236',
        name: 'New Name',
      });
    });

    it('should propagate errors from usersService.patchUser', async () => {
      mockUsersService.patchUser.mockRejectedValueOnce(new Error('Error'));
      await expect(
        controller.patchUser('ES9820385778983000760236', patchDto),
      ).rejects.toThrow('Error');
    });
  });

  describe('deleteUser', () => {
    it('should call usersService.deleteUser with iban', async () => {
      await controller.deleteUser('ES9820385778983000760236');
      expect(mockUsersService.deleteUser).toHaveBeenCalledWith(
        'ES9820385778983000760236',
      );
    });

    it('should resolve when usersService.deleteUser succeeds', async () => {
      await expect(
        controller.deleteUser('ES9820385778983000760236'),
      ).resolves.toBeUndefined();
    });

    it('should propagate errors from usersService.deleteUser', async () => {
      mockUsersService.deleteUser.mockRejectedValueOnce(new Error('Error'));
      await expect(
        controller.deleteUser('ES9820385778983000760236'),
      ).rejects.toThrow('Error');
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
      mockUsersService.getUsers.mockResolvedValueOnce([
        { iban: 'ES9820385778983000760236' },
      ]);
      const result = await controller.findAll();
      expect(result).toEqual([{ iban: 'ES9820385778983000760236' }]);
    });

    it('should propagate errors from usersService.getUsers', async () => {
      mockUsersService.getUsers.mockRejectedValueOnce(new Error('Error'));
      await expect(controller.findAll()).rejects.toThrow('Error');
    });
  });
});
