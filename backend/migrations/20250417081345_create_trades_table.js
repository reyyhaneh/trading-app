exports.up = function(knex) {
    return knex.schema.createTable('trades', function(table) {
      table.increments('id').primary();       // Auto-incremented ID
      table.integer('user_id').unsigned().notNullable(); // user id (foreign key later if you want)
      table.string('stock_symbol').notNullable();        // stock like 'AAPL', 'BTC'
      table.enum('type', ['buy', 'sell']).notNullable();  // either 'buy' or 'sell'
      table.integer('amount').notNullable();             // how many stocks bought/sold
      table.decimal('price', 14, 2).notNullable();        // price per unit
      table.timestamp('date').defaultTo(knex.fn.now());   // defaults to now

      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('trades');
  };
