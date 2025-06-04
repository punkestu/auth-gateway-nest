import { MigrationFn } from 'umzug';
import { Connection } from 'mysql2/promise';

export const up: MigrationFn<Connection> = async ({ context }) => {
  await context.execute(`
        CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
        );
    `);
};

export const down: MigrationFn<Connection> = async ({ context }) => {
  await context.execute(`
            DROP TABLE IF EXISTS users;
        `);
};
