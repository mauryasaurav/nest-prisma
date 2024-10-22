import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private async checkUserExists(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createUser(name: string, email: string): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) throw new ConflictException('Email already exists');

    return this.prisma.user.create({
      data: { name, email },
    });
  }

  async getUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * limit;
  
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: {
          deletedAt: null,
          email: search ? { contains: search, mode: 'insensitive' } : undefined,
        },
        skip,
        take: limit,
      }),
      this.prisma.user.count({
        where: {
          deletedAt: null,
          email: search ? { contains: search, mode: 'insensitive' } : undefined,
        },
      }),
    ]);
  
    return { users, total };
  }

  async getUserById(id: number): Promise<User> {
    return this.checkUserExists(id);
  }

  async updateUser(id: number, name: string, email: string): Promise<User> {
    await this.checkUserExists(id);

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== id)
      throw new ConflictException('Email already exists');

    return this.prisma.user.update({
      where: { id },
      data: { name, email },
    });
  }

  async softDeleteUser(id: number): Promise<User> {
    await this.checkUserExists(id);

    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
