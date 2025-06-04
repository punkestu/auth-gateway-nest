import { ChangePasswordRequest, User } from '../auth.model';

export const REPOSITORY = Symbol('REPOSITORY');

export interface IRepository {
  getByUsername(username: string): Promise<User>;
  getByEmail(email: string): Promise<User>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  requestChangePassword(email: string, newPassword: string): Promise<ChangePasswordRequest>;
  getRequestChangePassword(email: string): Promise<ChangePasswordRequest | null>;
  deleteRequestChangePassword(email: string): Promise<void>;
  sendConfirmationEmail(email: string, request: ChangePasswordRequest): Promise<void>;
  validateChangePassword(hashedId: string, request: ChangePasswordRequest): Promise<boolean>;
  changePassword(userId: string, newPassword: string, hashed?: boolean): Promise<void>;
  delete(userId: string): Promise<void>;
  getById(userId: string): Promise<User>;
  comparePassword(password: string, user: User): Promise<boolean>;
}
