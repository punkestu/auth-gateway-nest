import * as mysql from 'mysql2/promise';

export class MySQLPool {
  private static instance: mysql.Pool;

  private constructor() {}

  public static getInstance(): mysql.Pool {
    if (!MySQLPool.instance) {
      MySQLPool.instance = mysql.createPool({
        host: process.env.MYSQL_HOST || '127.0.0.1',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'secret',
        database: process.env.MYSQL_DATABASE || 'auth-gateway',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    }
    return MySQLPool.instance;
  }
}