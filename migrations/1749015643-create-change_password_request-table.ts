import { MigrationFn } from 'umzug';
import { Connection } from 'mysql2/promise';

export const up: MigrationFn<Connection> = async ({ context }) => {
  await context.execute(`
        CREATE TABLE IF NOT EXISTS change_password_request (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
  await context.execute(`
            CREATE INDEX idx_change_password_request_email ON change_password_request(email);
        `);
};

export const down: MigrationFn<Connection> = async ({ context }) => {
  await context.execute(`
                DROP INDEX IF EXISTS idx_change_password_request_email ON change_password_request;
            `);
  await context.execute(`
            DROP TABLE IF EXISTS change_password_request;
        `);
};
