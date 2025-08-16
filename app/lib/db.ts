import mysql from 'mysql2/promise';

const mockPool = {
  execute: async (sql: string, values?: any[]): Promise<[mysql.RowDataPacket[] | mysql.OkPacket, any]> => {
    console.log(`Mock DB Execute: ${sql} with values: ${JSON.stringify(values)}`);
    if (sql.startsWith('SELECT')) {
      if (sql.includes('FROM survey_results WHERE user_id = ? AND company_id = ?')) {
        const [userId, companyId] = values || [];
        if (userId === 'guest-123' && companyId === 'guest-company') {
            return [[{ id: 101, user_id: userId, company_id: companyId } as mysql.RowDataPacket], null];
        }
      }
      return [[], null];
    } else if (sql.startsWith('INSERT')) {
      return [{ insertId: 102, affectedRows: 1 } as mysql.OkPacket, null];
    } else if (sql.startsWith('UPDATE') || sql.startsWith('DELETE')) {
      return [{ affectedRows: 1 } as mysql.OkPacket, null];
    }
    return [{} as mysql.RowDataPacket[], null];
  },
  end: async () => {
    console.log('Mock DB Pool ended.');
  }
};

export async function getPool() {
  console.log('Using mock database pool for development.');
  return mockPool;
} 