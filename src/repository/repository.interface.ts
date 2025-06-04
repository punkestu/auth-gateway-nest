import { User } from '../auth.model';

export const REPOSITORY = Symbol('REPOSITORY');

export interface IRepository {
  getByUsername(username: string): Promise<User>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  changePassword(userId: string, newPassword: string): Promise<void>;
  delete(userId: string): Promise<void>;
  getById(userId: string): Promise<User>;
  comparePassword(password: string, user: User): Promise<boolean>;
}
