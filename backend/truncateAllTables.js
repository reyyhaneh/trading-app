// Require Knex and configuration
const knexConfig = require('./knexfile'); // Adjust this path to where your knexfile.js is
const environment = process.env.NODE_ENV || 'development';
const knex = require('knex')(knexConfig[environment]);

const truncateAllTables = async () => {
  try {
    // Fetch all table names
    const tables = await knex.raw(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public';
    `);

    // Extract table names
    const tableNames = tables.rows.map(row => row.tablename);

    // Disable foreign key checks (to prevent constraint errors)
    await knex.raw('SET session_replication_role = replica;');

    // Truncate each table
    for (const table of tableNames) {
      await knex(table).truncate();
      console.log(`🗑️ Truncated table: ${table}`);
    }

    // Re-enable foreign key checks
    await knex.raw('SET session_replication_role = DEFAULT;');

    console.log('✅ All tables truncated successfully.');
  } catch (error) {
    console.error('❌ Error truncating tables:', error);
  } finally {
    // Close database connection
    await knex.destroy();
  }
};

truncateAllTables();
