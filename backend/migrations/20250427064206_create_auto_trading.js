// migrations/xxxx_create_auto_trading_rule.js

exports.up = function(knex) {
    return knex.schema.createTable('auto_trading_rules', function(table) {
      table.increments('id').primary(); // SERIAL PRIMARY KEY
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE'); // FK to users
      table.string('stock_symbol').notNullable(); // Stock or crypto symbol
      table.string('condition_type').notNullable(); // 'price' or 'profit_loss'
      table.decimal('target_value', 18, 8).notNullable(); // High-precision target value
      table.string('action').notNullable(); // 'buy' or 'sell'
      table.timestamp('created_at').defaultTo(knex.fn.now()); // Created at
      table.timestamp('updated_at').defaultTo(knex.fn.now()); // Updated at
      table.boolean('active').defaultTo(true); // Active by default
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('auto_trading_rules');
  };
  