import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import ResponseDto from 'src/utils/create-response.dto';
import * as bcrypt from 'bcrypt';
import { EMAIL_ALREADY_EXISTS_MESSAGE, PHONE_ALREADY_EXISTS_MESSAGE, SUPER_ADMIN_ACCESS_DENIED, USER_CREATED_MESSAGE, USER_DELETED_MESSAGE, USER_NOT_FOUND_MESSAGE, USER_RETRIEVED_MESSAGE, USER_UPDATED_MESSAGE } from 'src/helper/message';
import { ROLE } from 'src/helper/role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  // CREATE USER
  async createUser(createUserDto: CreateUserDto): Promise<ResponseDto> {
    try {
      const { first_name, last_name, phone, email, password } = createUserDto;

      const existingUser = await this.getUserByEmail(email);

      if (existingUser) {
        throw new BadRequestException(EMAIL_ALREADY_EXISTS_MESSAGE);
      }

      const existingPhone = await this.userRepository.findOneBy({ phone });

      if (existingPhone) {
        throw new BadRequestException(PHONE_ALREADY_EXISTS_MESSAGE);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = this.userRepository.create({
        first_name,
        last_name,
        phone,
        email,
        password: hashedPassword,
        role: ROLE.SUB,
      });

      await this.userRepository.save(user);
      user.password = undefined;

      return {
        statusCode: HttpStatus.CREATED,
        message: USER_CREATED_MESSAGE,
        data: user,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //UPDATE USER_BY ID
  async updateUserById(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<ResponseDto> {
    try {
      const existinguser = await this.userRepository.findOne({
        where: { id, is_active: true },
      });

      if (!existinguser) {
        throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
      }

      const user = new User();
      user.first_name = updateUserDto.first_name;
      user.last_name = updateUserDto.last_name;
      user.phone = updateUserDto.phone;
      user.is_active = updateUserDto.is_active;

      const result = await this.userRepository.update(id, user);

      if (result.affected > 0) {
        return {
          statusCode: 201,
          message: USER_UPDATED_MESSAGE,
        };
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // DELETE USER_BY ID
  async deleteUserById(id: number): Promise<ResponseDto> {
    try {
      const user = await this.getUserById(id);

      if (!user) {
        throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
      }

      const result = await this.userRepository.delete(id);

      if (result.affected > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: USER_DELETED_MESSAGE,
        };
      }
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  // GET USERB_BY EMAIL ID
  async getUserByEmail(email: string): Promise<User> {
    try {
      const result = await this.userRepository.findOne({ where: { email } });
      return result;

    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET USER_BY ID
  async getUserById(id: number): Promise<ResponseDto> {
    try {
      const query = this.userRepository
        .createQueryBuilder('user')
        .where('user.is_active = :isActive', { isActive: true })
        .andWhere('user.id = :id', { id });

      const user = await query.getOne();

      if (!user) {
        throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
      }

      return {
        statusCode: 200,
        data: user,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // reset password token and expire time save
  async setTokenAndDate(email, token: string, expireTime: Date): Promise<void> {
    try {
      const user = new User();
      user.reset_password_token = token;
      user.reset_password_token_expire_time = expireTime;

      if (token != null && expireTime != null) {
        await this.userRepository
          .createQueryBuilder()
          .update()
          .set(user)
          .where({ email })
          .execute();
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // update password user
  async userPasswordUpdate(email: string, password: string): Promise<boolean> {
    try {
      const user = new User();
      user.password = password;
      const result = await this.userRepository
        .createQueryBuilder()
        .update(user)
        .set({ password })
        .where({ email })
        .execute();
      if (!result) {
        return false;
      }
      return true;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // get All user
  async findAllUsers(page: number, limit: number, name?: string): Promise<ResponseDto> {
    try {
      page = page || 1;
      limit = limit || 5;
      const skip = (page - 1) * limit;

      let query = this.userRepository.createQueryBuilder('user');

      if (name) {
        query = query.where('user.first_name LIKE :name', { name: `%${name}%` });
      }

      const users = await query
        .skip(skip)
        .take(limit)
        .getMany();

      return {
        statusCode: 200,
        message: 'Users retrieved successfully',
        data: users,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

