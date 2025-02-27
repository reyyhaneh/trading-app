exports.up = function(knex) {
    return knex.schema.createTable('user_portfolio', (table) => {
      table.increments('id').primary();
      table.integer('user_id').notNullable().index();
      table.string('stock_symbol', 10).notNullable().index();
      table.decimal('total_amount', 18, 8).defaultTo(0);
      table.decimal('total_spent', 18, 8).defaultTo(0);
      table.decimal('total_earned', 18, 8).defaultTo(0);
      table.decimal('avg_cost_per_unit', 18, 8).defaultTo(0);
      table.decimal('profit_loss', 18, 8).defaultTo(0);
      table.timestamp('updated_at').defaultTo(knex.fn.now());
  
      // Unique constraint to ensure one entry per user and asset
      table.unique(['user_id', 'stock_symbol']);
  
      // Foreign key (if you have a users table)
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('user_portfolio');
  };
  