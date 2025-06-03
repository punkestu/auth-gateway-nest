import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpException,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import {
  Errors,
  LoginDto,
  LoginResponse,
  RegisterDto,
  RegisterResponse,
  ValidateDto,
  ValidateResponse,
} from './auth.model';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @HttpCode(200)
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
  async register(
    @Body() registerRequest: RegisterDto,
  ): Promise<RegisterResponse> {
    try {
      const message = await this.authService.register(
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

  @Post('refresh')
  @HttpCode(200)
  async refreshToken(
    @Body() refreshRequest: { refreshToken: string },
  ): Promise<LoginResponse> {
    try {
      const payload = await this.jwtService.verifyAsync(
        refreshRequest.refreshToken,
      );
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
          { status: 500, message: 'Invalid refresh token' },
          401,
        );
      }
    }
  }

  @Post('validate')
  @HttpCode(200)
  async validateToken(
    @Headers() validateRequest: ValidateDto,
  ): Promise<ValidateResponse> {
    try {
      const token = validateRequest.authorization.replace('Bearer ', '');
      const payload = await this.jwtService.verifyAsync(token);
      if (!payload || !payload.sub) {
        throw new Errors(401, ['Invalid token']);
      }
      const user = await this.authService.getUserById(payload.sub);
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
