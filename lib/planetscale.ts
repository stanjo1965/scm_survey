import mysql from 'mysql2/promise';

const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

export const getConnection = async () => {
  return await connection;
};

export const executeQuery = async (sql: string, values?: any[]) => {
  const conn = await getConnection();
  const [rows] = await conn.execute(sql, values);
  return rows;
}; 