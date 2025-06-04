import { Injectable } from '@nestjs/common';
import { IRepository } from './repository.interface';
import { ChangePasswordRequest, User } from '../auth.model';

@Injectable()
export class RepositoryMock implements IRepository {
  getByUsername(username: string): Promise<User> {
    return Promise.resolve({
      id: '1',
      email: 'mock@mail.com',
      username,
      password: 'mockPassword',
    });
  }
  getByEmail(email: string): Promise<User> {
    return Promise.resolve({
      id: '1',
      email,
      username: 'mockUser',
      password: 'mockPassword',
    });
  }
  create(user: User): Promise<User> {
    return Promise.resolve({ ...user, id: 'mockId' });
  }
  update(user: User): Promise<User> {
    return Promise.resolve({ ...user, password: 'updatedMockPassword' });
  }
  requestChangePassword(email: string, newPassword: string): Promise<ChangePasswordRequest> {
    return Promise.resolve({
      id: 'mockChangePasswordId',
      email,
      password: newPassword,
      created_at: new Date(),
    });
  }
  validateChangePassword(hashedId: string, request: ChangePasswordRequest): Promise<boolean> {
    return Promise.resolve(hashedId === request.id);
  }
  getRequestChangePassword(email: string): Promise<ChangePasswordRequest | null> {
    return Promise.resolve(null);
  }
  deleteRequestChangePassword(email: string): Promise<void> {
    return Promise.resolve();
  }
  sendConfirmationEmail(email: string, request: ChangePasswordRequest): Promise<void> {
    return Promise.resolve();
  }
  changePassword(userId: string, newPassword: string): Promise<void> {
    return Promise.resolve();
  }
  delete(userId: string): Promise<void> {
    return Promise.resolve();
  }
  getById(userId: string): Promise<User> {
    return Promise.resolve({
      id: userId,
      email: 'mock@mail.com',
      username: 'mockUser',
      password: 'mockPassword',
    });
  }
  generateToken(user: User): Promise<string> {
    return Promise.resolve(`mockTokenForUser:${user.username}`);
  }
  validateToken(token: string): Promise<User> {
    const username = token.split(':')[1];
    return Promise.resolve({
      id: 'mockId',
      email: 'mock@mail.com',
      username,
      password: 'mockPassword',
    });
  }
  comparePassword(password: string, user: User): Promise<boolean> {
    return Promise.resolve(password === user.password);
  }
}
