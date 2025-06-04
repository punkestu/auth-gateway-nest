import { Injectable } from '@nestjs/common';
import { Errors, User } from '../auth.model';
import { MySQLPool } from 'utils/mysql_pool';
import { RowDataPacket } from 'mysql2';
import mysql from 'mysql2/promise';
import { hash, compare } from 'bcrypt';

class UserDB implements RowDataPacket {
  ['constructor']: { name: 'RowDataPacket' };
  id: string;
  email: string;
  username: string;
  password: string;
}

@Injectable()
export class RepositoryMysql {
  private readonly mysqlPoll: mysql.Pool;
  constructor() {
    this.mysqlPoll = MySQLPool.getInstance();
  }
  async getByUsername(username: string): Promise<User | null> {
    return this.mysqlPoll.getConnection().then(async (conn) => {
      const [users] = await conn.execute<UserDB[]>(
        'SELECT * FROM users WHERE username = ?',
        [username],
      );
      conn.release();
      if (users.length === 0) {
        return null;
      }
      const user = users[0];
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        password: user.password,
      };
    });
  }
  create(user: User): Promise<User> {
    return this.mysqlPoll.getConnection().then(async (conn) => {
      const hashedPassword = await hash(user.password, 10);
      const [result] = await conn.execute<mysql.ResultSetHeader>(
        'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
        [user.email, user.username, hashedPassword],
      );
      conn.release();
      return { ...user, id: result.insertId.toString() };
    });
  }
  update(user: User): Promise<User> {
    return this.mysqlPoll.getConnection().then(async (conn) => {
      await conn.execute<mysql.ResultSetHeader>(
        'UPDATE users SET email = ?, username = ? WHERE id = ?',
        [user.email, user.username, user.id],
      );
      conn.release();
      return user;
    });
  }
  changePassword(userId: string, newPassword: string): Promise<void> {
    return this.mysqlPoll.getConnection().then(async (conn) => {
      const hashedPassword = await hash(newPassword, 10);
      await conn.execute<mysql.ResultSetHeader>(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId],
      );
      conn.release();
    });
  }
  delete(userId: string): Promise<void> {
    return this.mysqlPoll.getConnection().then(async (conn) => {
      const [result] = await conn.execute<mysql.ResultSetHeader>(
        'DELETE FROM users WHERE id = ?',
        [userId],
      );
      conn.release();
      if (result.affectedRows === 0) {
        throw new Errors(404, [`User with id ${userId} not found`]);
      }
    });
  }
  getById(userId: string): Promise<User | null> {
    return this.mysqlPoll.getConnection().then(async (conn) => {
      const [users] = await conn.execute<UserDB[]>(
        'SELECT * FROM users WHERE id = ?',
        [userId],
      );
      conn.release();
      if (users.length === 0) {
        return null;
      }
      const user = users[0];
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        password: user.password,
      };
    });
  }
  comparePassword(password: string, user: User): Promise<boolean> {
    return compare(password, user.password);
  }
}
