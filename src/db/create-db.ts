import { createConnection } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

async function createDatabaseIfNotExists() {
  const connection = await createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

  const databaseName = process.env.DB_DATABASE;

  if (!databaseName) {
    throw new Error('Database name is not defined in environment variables.');
  }

  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SHOW DATABASES LIKE '${databaseName}'`,
    );
    if (rows.length === 0) {
      await connection.execute(`CREATE DATABASE ${databaseName}`);
      console.log(`Database '${databaseName}' created successfully.`);
    } else {
      console.log(`Database '${databaseName}' already exists.`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await connection.end();
  }
}

export { createDatabaseIfNotExists };
