import { Umzug, JSONStorage } from 'umzug';
import { createConnection } from 'mysql2/promise';
import { join } from 'path';

async function runMigrations() {
  const connection = await createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'secret',
    database: process.env.MYSQL_DATABASE || 'auth-gateway',
  });

  const umzug = new Umzug({
    migrations: {
      glob: join(__dirname, '../migrations', '*.ts'),
    },
    context: connection,
    storage: new JSONStorage({
      path: join(__dirname, '../migrations.json'),
    }),
    logger: console,
  });

  await umzug.up();
  await connection.end();
}

runMigrations()
  .then(() => {
    console.log('Migrations completed successfully');
  })
  .catch((error) => {
    console.error('Migration failed:', error);
  });
