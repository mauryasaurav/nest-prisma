import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { UserService } from '../../modules/user/user.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';

const mockUser: User = {
  id: 1,
  name: 'Saurav Test',
  email: 'saurav@test.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkUserExists', () => {
    it('should return user if found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await userService['checkUserExists'](mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(userService['checkUserExists'](mockUser.id)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });
  });

  describe('createUser', () => {
    it('should create a user if email is unique', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser);

      const result = await userService.createUser(
        mockUser.name,
        mockUser.email,
      );
      expect(result).toEqual(mockUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: { name: mockUser.name, email: mockUser.email },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      await expect(
        userService.createUser(mockUser.name, mockUser.email),
      ).rejects.toThrow(new ConflictException('Email already exists'));
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await userService.getUserById(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(userService.getUserById(mockUser.id)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });
  });

  describe('updateUser', () => {
    it('should update the user if found and email is unique', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser); // Existing user
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockUser);

      const result = await userService.updateUser(
        mockUser.id,
        mockUser.name,
        mockUser.email,
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(
        userService.updateUser(mockUser.id, mockUser.name, mockUser.email),
      ).rejects.toThrow(new NotFoundException('User not found'));
    });

    it('should throw ConflictException if email already exists for another user', async () => {
      const anotherUser = { ...mockUser, id: 2 };
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(anotherUser);

      await expect(
        userService.updateUser(mockUser.id, mockUser.name, mockUser.email),
      ).rejects.toThrow(new ConflictException('Email already exists'));
    });
  });

  describe('softDeleteUser', () => {
    it('should soft delete the user if found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockUser);

      const result = await userService.softDeleteUser(mockUser.id);
      expect(result).toEqual(mockUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(userService.softDeleteUser(mockUser.id)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const users = [mockUser];
      const total = 1;

      jest
        .spyOn(prismaService, '$transaction')
        .mockResolvedValue([users, total]);

      const result = await userService.getUsers(1, 10);

      expect(result).toEqual({
        users,
        total,
      });

      expect(prismaService.$transaction).toHaveBeenCalledTimes(1);

      expect(prismaService.$transaction).toHaveBeenCalledWith([
        expect.anything(),
        expect.anything(),
      ]);
    });

    it('should return filtered users by email', async () => {
      const users = [mockUser];
      const total = 1;

      jest
        .spyOn(prismaService, '$transaction')
        .mockResolvedValue([users, total]);

      const result = await userService.getUsers(1, 10, 'saurav@test.com');

      expect(result).toEqual({
        users,
        total,
      });

      expect(prismaService.$transaction).toHaveBeenCalledTimes(1);

      expect(prismaService.$transaction).toHaveBeenCalledWith([
        expect.anything(),
        expect.anything(),
      ]);
    });
  });
});
