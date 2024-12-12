const { Pool } = require('pg');

// PostgreSQL connection configuration
const pool = new Pool({
  user: 'reyhaneh',
  host: 'localhost',
  database: 'trading_app',
  password: 'njrfiugf',
  port: 5432, // Default PostgreSQL port
});

module.exports = pool;
