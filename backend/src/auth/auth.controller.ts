/* eslint-disable @typescript-eslint/require-await */
import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  HttpException,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  AuthResponse,
  UserProfile,
} from '../types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      throw new HttpException(
        (error as Error).message || 'Registration failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      throw new HttpException(
        (error as Error).message || 'Login failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get('profile')
  async getProfile(
    @Headers('authorization') authorization: string,
  ): Promise<UserProfile> {
    const userId = this.extractUserId(authorization);
    const profile = await this.authService.getProfile(userId);

    if (!profile) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return profile;
  }

  @Put('profile')
  async updateProfile(
    @Headers('authorization') authorization: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfile> {
    const userId = this.extractUserId(authorization);
    const profile = await this.authService.updateProfile(
      userId,
      updateProfileDto,
    );

    if (!profile) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return profile;
  }

  @Post('logout')
  async logout(@Headers('authorization') authorization: string): Promise<{
    message: string;
  }> {
    this.extractUserId(authorization);
    return { message: 'Logged out successfully' };
  }

  private extractUserId(authorization: string): string {
    if (!authorization) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const token = authorization.replace('Bearer ', '');
    if (!token) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return token;
  }
}
