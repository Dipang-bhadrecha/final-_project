import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, ParseIntPipe, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import ResponseDto from 'src/utils/create-response.dto';
import { ROLE } from 'src/helper/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // CREATE USER
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(ROLE.SUPER)
  @Post('register')
  async userRegister(@Body() createUserDto: CreateUserDto): Promise<ResponseDto> {
    return this.userService.createUser(createUserDto);
  }

  // UPDATE USER
  @Put(':id')
  async updateUserById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseDto> {
    return await this.userService.updateUserById(id, updateUserDto);
  }

  // DELETE USER
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(ROLE.ADMIN, ROLE.USER)
  @Delete(':id')
  async deleteUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto> {
    return this.userService.deleteUserById(id);
  }

  @Get('findAll')
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'name', type: String, required: false })
  @ApiResponse({ status: 200, description: 'OK' })
  async getAllUsers(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('name') name: string,
  ): Promise<ResponseDto> {
    return this.userService.findAllUsers(page, limit, name);
  }
}