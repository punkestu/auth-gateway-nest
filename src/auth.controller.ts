import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import {
  ChangePasswordDto,
  Errors,
  LoginDto,
  LoginResponse,
  RefreshDto,
  RefreshResponse,
  RegisterDto,
  RegisterResponse,
  RequestChangePasswordDto,
  UserWithoutPassword,
  ValidateResponse,
} from './auth.model';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from './auth.guard';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('me')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Returns the authenticated user without password',
    type: UserWithoutPassword,
  })
  async getMe(@Req() req): Promise<UserWithoutPassword> {
    try {
      if (!req.user || !req.user.sub || req.user.type !== 'access') {
        throw new Errors(401, ['Invalid token']);
      }
      const user = await this.authService.getUserById(req.user.sub);
      if (!user) {
        throw new Errors(404, ['User not found']);
      }
      return UserWithoutPassword.from(user);
    } catch (error) {
      if (error instanceof Errors) {
        throw new HttpException(error, error.status || 500);
      } else {
        throw new HttpException(
          { status: 500, message: 'Internal Server Error' },
          500,
        );
      }
    }
  }

  @Post('login')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Returns access and refresh tokens',
    type: LoginResponse,
  })
  async login(@Body() loginRequest: LoginDto): Promise<LoginResponse> {
    try {
      const user = await this.authService.login(
        loginRequest.username,
        loginRequest.password,
      );
      const accessToken = await this.jwtService.signAsync({
        sub: user.id,
        type: 'access',
        username: user.username,
      });
      const refreshToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          type: 'refresh',
          username: user.username,
        },
        { expiresIn: '7d' }, // Refresh token valid for 7 days
      );

      return {
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    } catch (error) {
      if (error instanceof Errors) {
        throw new HttpException(error, error.status || 500);
      } else {
        throw new HttpException(
          { status: 500, message: 'Internal Server Error' },
          500,
        );
      }
    }
  }

  @Post('register')
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: 'Returns a success message upon successful registration',
    type: RegisterResponse,
  })
  async register(
    @Body() registerRequest: RegisterDto,
  ): Promise<RegisterResponse> {
    try {
      const message = await this.authService.register(
        registerRequest.email,
        registerRequest.username,
        registerRequest.password,
      );
      return { message };
    } catch (error) {
      if (error instanceof Errors) {
        throw new HttpException(error, error.status || 500);
      } else {
        throw new HttpException(
          {
            status: 500,
            message: 'Internal Server Error',
            messages: [error.message || 'An unexpected error occurred'],
          } as Errors,
          500,
        );
      }
    }
  }

  @Patch('change-password')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Returns a success message upon successful password change',
  })
  async changePassword(
    @Req() req,
    @Body() body: ChangePasswordDto,
  ): Promise<string> {
    try {
      if (!req.user || !req.user.sub || req.user.type !== 'access') {
        throw new Errors(401, ['Invalid token']);
      }
      const userId = req.user.sub;
      await this.authService.changePassword(userId, body.newPassword);
      return `Password for user ID ${userId} changed successfully`;
    } catch (error) {
      if (error instanceof Errors) {
        throw new HttpException(error, error.status || 500);
      } else {
        throw new HttpException(
          { status: 500, message: 'Internal Server Error: ' + error.message },
          500,
        );
      }
    }
  }

  @Post('request-change-password')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description:
      'Returns a success message upon successful change password request',
  })
  async requestChangePassword(
    @Body() body: RequestChangePasswordDto,
  ): Promise<string> {
    try {
      const message = await this.authService.requestChangePassword(
        body.email,
        body.newPassword,
      );
      return message;
    } catch (error) {
      if (error instanceof Errors) {
        throw new HttpException(error, error.status || 500);
      } else {
        throw new HttpException(
          { status: 500, message: 'Internal Server Error: ' + error.message },
          500,
        );
      }
    }
  }

  @Get('confirm-change-password/:hashedId')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Returns a success message upon successful password change',
  })
  async changePasswordWithHashedId(
    @Param('hashedId') hashedIdParam: string,
    @Query('email') email: string,
  ): Promise<string> {
    try {
      const result = await this.authService.confirmChangePassword(email, hashedIdParam);
      return result;
    } catch (error) {
      if (error instanceof Errors) {
        throw new HttpException(error, error.status || 500);
      } else {
        throw new HttpException(
          { status: 500, message: 'Internal Server Error: ' + error.message },
          500,
        );
      }
    }
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Returns new access and refresh tokens',
    type: RefreshResponse,
  })
  async refreshToken(
    @Body() refreshRequest: RefreshDto,
  ): Promise<RefreshResponse> {
    try {
      const payload = await this.jwtService
        .verifyAsync(refreshRequest.refreshToken)
        .catch(() => {
          throw new Errors(401, ['Invalid refresh token']);
        });
      if (!payload || !payload.sub || payload.type !== 'refresh') {
        throw new Errors(401, ['Invalid refresh token']);
      }
      const user = await this.authService.getUserById(payload.sub);
      if (!user) {
        throw new Errors(404, ['User not found']);
      }
      const accessToken = await this.jwtService.signAsync({
        sub: user.id,
        type: 'access',
        username: user.username,
      });
      const refreshToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          type: 'refresh',
          username: user.username,
        },
        { expiresIn: '7d' }, // Refresh token valid for 7 days
      );
      return {
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    } catch (error) {
      if (error instanceof Errors) {
        throw new HttpException(error, error.status || 500);
      } else {
        throw new HttpException(
          { status: 500, message: 'Internal Server Error: ' + error.message },
          401,
        );
      }
    }
  }

  @Post('validate')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Validates the access token and returns user information',
    type: ValidateResponse,
  })
  async validateToken(@Req() req): Promise<ValidateResponse> {
    try {
      if (!req.user || !req.user.sub || req.user.type !== 'access') {
        throw new Errors(401, ['Invalid token']);
      }
      const user = await this.authService.getUserById(req.user.sub);
      if (!user) {
        throw new Errors(404, ['User not found']);
      }
      return {
        valid: true,
        message: `User ${user.username} is valid`,
      };
    } catch (error) {
      if (error instanceof Errors) {
        throw new HttpException(error, error.status || 500);
      } else {
        throw new HttpException(
          {
            status: 500,
            message: 'Invalid token',
            messages: [error.message || 'An unexpected error occurred'],
          } as Errors,
          401,
        );
      }
    }
  }
}
