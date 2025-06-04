import { Inject, Injectable } from '@nestjs/common';
import { IRepository, REPOSITORY } from './repository/repository.interface';
import { Errors, User } from './auth.model';

@Injectable()
export class AuthService {
  constructor(
    @Inject(REPOSITORY)
    private readonly repository: IRepository,
  ) {}

  login(username: string, password: string): Promise<User> {
    return this.repository.getByUsername(username).then(async (user) => {
      if (!user) {
        throw new Errors(401, ['Invalid username']);
      }
      const isMatch = await this.repository.comparePassword(password, user);
      if (!isMatch) {
        throw new Errors(401, ['Invalid password']);
      }
      return user;
    });
  }

  register(username: string, password: string): Promise<string> {
    return this.repository
      .getByUsername(username)
      .then((existingUser) => {
        if (existingUser) {
          throw new Errors(400, ['Username already exists']);
        }
      })
      .then(() => this.repository.create({ username, password }))
      .then((user) => {
        return `User ${user.username} registered successfully`;
      });
  }

  getUserById(userId: string): Promise<User> {
    return this.repository.getById(userId);
  }

  updateUser(user: User): Promise<string> {
    return this.repository.update(user).then((updatedUser) => {
      return `User ${updatedUser.username} updated successfully`;
    });
  }

  deleteUser(userId: string): Promise<string> {
    return this.repository.delete(userId).then(() => {
      return `User with ID ${userId} deleted successfully`;
    });
  }
}
