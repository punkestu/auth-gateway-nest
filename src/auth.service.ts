import { Inject, Injectable } from '@nestjs/common';
import { IRepository, REPOSITORY } from './repository/repository.interface';
import { ChangePasswordRequest, Errors, User } from './auth.model';

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

  register(email: string, username: string, password: string): Promise<string> {
    return this.repository
      .getByUsername(username)
      .then((existingUser) => {
        if (existingUser) {
          throw new Errors(400, ['Username already exists']);
        }
      })
      .then(() => this.repository.create({ email, username, password }))
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

  requestChangePassword(email: string, newPassword: string): Promise<ChangePasswordRequest> {
    return this.repository
      .getByEmail(email)
      .then((user) => {
        if (!user) {
          throw new Errors(404, ['User not found']);
        }
      })
      .then(() => this.repository.getRequestChangePassword(email))
      .then((request) => {
        if (request) {
          throw new Errors(400, ['Change password request already exists']);
        }
        return this.repository.requestChangePassword(email, newPassword);
      })
  }

  confirmChangePassword(email: string, hashedId: string): Promise<string> {
    return this.repository
      .getRequestChangePassword(email)
      .then(async (request) => {
        if (!request) {
          throw new Errors(404, ['Change password request not found']);
        }
        const isValid = await this.repository.validateChangePassword(
          hashedId,
          request,
        );
        if (!isValid) {
          throw new Errors(400, ['Invalid change password request']);
        }

        const user = await this.repository.getByEmail(email);
        if (!user) {
          throw new Errors(404, ['User not found']);
        }

        return this.repository.changePassword(
          user.id ?? '',
          request.password,
          true,
        );
      })
      .then(() => {
        return this.repository.deleteRequestChangePassword(email);
      })
      .then(() => {
        return `Password for ${email} changed successfully`;
      });
  }

  changePassword(userId: string, newPassword: string): Promise<string> {
    return this.repository
      .getById(userId)
      .then((user) => {
        if (!user) {
          throw new Errors(404, ['User not found']);
        }
        return this.repository.changePassword(userId, newPassword);
      })
      .then(() => {
        return `Password for user ID ${userId} changed successfully`;
      });
  }

  deleteUser(userId: string): Promise<string> {
    return this.repository.delete(userId).then(() => {
      return `User with ID ${userId} deleted successfully`;
    });
  }
}
