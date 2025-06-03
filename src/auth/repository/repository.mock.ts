import { Injectable } from '@nestjs/common';
import { IRepository } from './repository.interface';
import { User } from '../auth.model';

@Injectable()
export class RepositoryMock implements IRepository {
  getByUsername(username: string): Promise<User> {
    return Promise.resolve({ id: '1', username, password: 'mockPassword' });
  }
  create(user: User): Promise<User> {
    return Promise.resolve({ ...user, id: 'mockId' });
  }
  update(user: User): Promise<User> {
    return Promise.resolve({ ...user, password: 'updatedMockPassword' });
  }
  delete(userId: string): Promise<void> {
    return Promise.resolve();
  }
  getById(userId: string): Promise<User> {
    return Promise.resolve({
      id: userId,
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
      username,
      password: 'mockPassword',
    });
  }
  comparePassword(password: string, user: User): Promise<boolean> {
    return Promise.resolve(password === user.password);
  }
}
