const { logger } = require('../utils/logger');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

logger.info('Database configuration:', {
  type: 'PostgreSQL',
  url: process.env.DATABASE_URL
});

// Initialize database connection
async function initializeDatabase() {
  try {
    await prisma.$connect();
    logger.info('Database connection successful');
    return prisma;
  } catch (error) {
    logger.error('Database initialization error:', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Initialize database on module load
initializeDatabase().catch(err => {
  logger.error('Failed to initialize database:', err);
  process.exit(1);
});

module.exports = {
  prisma,
  query: async (sql, params = []) => {
    try {
      const result = await prisma.$queryRaw`${sql} ${params}`;
      return {
        rows: Array.isArray(result) ? result : [],
        rowCount: Array.isArray(result) ? result.length : 0,
        lastID: null
      };
    } catch (error) {
      logger.error('Query error:', {
        sql,
        params,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  },
  
  // Helper method to get a single row
  queryOne: async (sql, params = []) => {
    const result = await prisma.$queryRaw`${sql} ${params}`;
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  },

  // Get the database instance
  getDb: () => prisma
}; 