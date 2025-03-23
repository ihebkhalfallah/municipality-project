import { Client } from 'pg';

async function createDatabaseIfNotExists() {
  const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_SSL } =
    process.env;

  if (!DB_HOST || !DB_PORT || !DB_USERNAME || !DB_PASSWORD || !DB_DATABASE) {
    throw new Error(
      'One or more required environment variables are not defined.',
    );
  }

  const client = new Client({
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: 'postgres',
    ssl: DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  const databaseName = DB_DATABASE;

  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [databaseName],
    );
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE ${databaseName}`);
      console.log(`Database '${databaseName}' created successfully.`);
    } else {
      console.log(`Database '${databaseName}' already exists.`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await client.end();
  }
}

export { createDatabaseIfNotExists };
