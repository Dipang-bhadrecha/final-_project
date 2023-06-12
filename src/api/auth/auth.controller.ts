import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './interfaces/login-response.dto';
import UpdateResponseDto from 'src/utils/update-response.dto';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) { }

  // LOGIN
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  // FORGOT PASSWORD
  @Post('/forgot-password')
  async forgotPassword(@Body('email') email: string, @Req() req): Promise<UpdateResponseDto> {
    return this.authService.forgotPassword(email, req);
  }

  // RESET PASSWORD
  @Post('/password-reset/:token')
  async resetPassword(@Param('token') token: string, @Body() userPassword): Promise<UpdateResponseDto> {
    return await this.authService.resetPassword(token, userPassword);
  }
}

