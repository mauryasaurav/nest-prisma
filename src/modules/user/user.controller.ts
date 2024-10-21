import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

interface Response<T> {
  success: boolean;
  message: string;
  data: T;
}

@Controller('api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() body: CreateUserDto): Promise<Response<User>> {
    const user = await this.userService.createUser(body.name, body.email);
    return {
      success: true,
      message: 'User created successfully',
      data: user,
    };
  }

  @Get()
  async getUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ): Promise<Response<{ total: number; page: number; users: User[] }>> {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const { users, total } = await this.userService.getUsers(
      pageNumber,
      limitNumber,
      search,
    );
    return {
      success: true,
      message: 'Users retrieved successfully',
      data: {
        page: pageNumber,
        total,
        users,
      },
    };
  }

  @Get(':id')
  async getUser(@Param('id') id: number): Promise<Response<User>> {
    const user = await this.userService.getUserById(Number(id));
    return {
      success: true,
      message: 'User retrieved successfully',
      data: user,
    };
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() body: UpdateUserDto,
  ): Promise<Response<User>> {
    const user = await this.userService.updateUser(
      Number(id),
      body.name,
      body.email,
    );
    return {
      success: true,
      message: 'User updated successfully',
      data: user,
    };
  }

  @Delete(':id')
  async softDeleteUser(@Param('id') id: number): Promise<Response<User>> {
    const user = await this.userService.softDeleteUser(Number(id));
    return {
      success: true,
      message: 'User deleted successfully',
      data: user,
    };
  }
}
