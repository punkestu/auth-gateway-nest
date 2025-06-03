import { IsString } from 'class-validator';

export class User {
  id?: string;
  username: string;
  password: string;
}

export class LoginDto {
  @IsString()
  username: string;
  @IsString()
  password: string;
}

export class RegisterDto {
  @IsString()
  username: string;
  @IsString()
  password: string;
}

export class RefreshDto {
  @IsString()
  refreshToken: string;
}

export class ValidateDto {
  @IsString()
  authorization: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface RegisterResponse {
  message: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface ValidateResponse {
  valid: boolean;
  message: string;
}

export class UserWithoutPassword {
  id: string;
  username: string;
  public static from(user: User): UserWithoutPassword {
    return {
      id: user.id ?? '',
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
