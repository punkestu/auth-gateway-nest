import { ApiProperty, ApiResponse, ApiResponseProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class User {
  id?: string;
  email: string;
  username: string;
  password: string;
}

export class ChangePasswordRequest {
  id?: string;
  email: string;
  password: string;
  createdAt?: Date;
}

export class LoginDto {
  @IsString()
  @ApiProperty({
    description: 'Username for login',
    example: 'john_doe',
  })
  username: string;
  @IsString()
  @ApiProperty({
    description: 'Password for login',
    example: 'securepassword123',
  })
  password: string;
}

export class RegisterDto {
  @IsString()
  @ApiProperty({
    description: 'Email for registration',
    example: 'janedoe@mail.com',
  })
  email: string;
  @IsString()
  @ApiProperty({
    description: 'Username for registration',
    example: 'jane_doe',
  })
  username: string;
  @IsString()
  @ApiProperty({
    description: 'Password for registration',
    example: 'securepassword123',
  })
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  @ApiProperty({
    description: 'New password for the user',
    example: 'newsecurepassword456',
  })
  newPassword: string;
}

export class RequestChangePasswordDto {
  @IsString()
  @ApiProperty({
    description: 'Email for requesting password change',
    example: 'johndoe@mail.com'
  })
  email: string;
  @IsString()
  @ApiProperty({
    description: 'New password for the user',
    example: 'newsecurepassword456',
  })
  newPassword: string;
}

export class RefreshDto {
  @IsString()
  @ApiProperty({
    description: 'Authorization token for refreshing session',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}

export class LoginResponse {
  @ApiResponseProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;
  @ApiResponseProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken?: string;
}

export class RegisterResponse {
  @ApiResponseProperty({
    type: String,
    example: 'User registered successfully',
  })
  message: string;
}

export class RefreshResponse {
  @ApiResponseProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;
  @ApiResponseProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken?: string;
}

export class ValidateResponse {
  @ApiResponseProperty({
    type: Boolean,
    example: true,
  })
  valid: boolean;
  @ApiResponseProperty({
    type: String,
    example: 'User is valid',
  })
  message: string;
}

export class UserWithoutPassword {
  @ApiResponseProperty({
    type: String,
    example: '12345',
  })
  id: string;
  @ApiResponseProperty({
    type: String,
    example: 'johndoe@mail.com',
  })
  email: string;
  @ApiResponseProperty({
    type: String,
    example: 'john_doe',
  })
  username: string;
  public static from(user: User): UserWithoutPassword {
    return {
      id: user.id ?? '',
      email: user.email,
      username: user.username,
    };
  }
}

export class Errors extends Error {
  constructor(
    public status: number,
    public messages: string[],
  ) {
    super(messages.join(', '));
  }
}
