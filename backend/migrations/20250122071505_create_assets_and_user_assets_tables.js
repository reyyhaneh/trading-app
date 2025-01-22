exports.up = async function(knex) {
    // Create assets table
    await knex.schema.createTable('assets', function(table) {
      table.string('symbol', 20).primary();
      table.string('name', 255).notNullable();
      table.text('description');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  
    // Create user_assets table
    await knex.schema.createTable('user_assets', function(table) {
      table.increments('id').primary();
      table.integer('user_id').notNullable()
           .references('id').inTable('users').onDelete('CASCADE');
      table.string('asset_symbol', 20).notNullable()
           .references('symbol').inTable('assets').onDelete('CASCADE');
      table.decimal('amount', 20, 8).notNullable().defaultTo(0);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  };
  
  exports.down = async function(knex) {
    // Drop user_assets first due to foreign key dependency
    await knex.schema.dropTableIfExists('user_assets');
    await knex.schema.dropTableIfExists('assets');
  };
  