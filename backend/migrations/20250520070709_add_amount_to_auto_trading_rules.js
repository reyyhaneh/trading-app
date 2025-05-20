exports.up = function(knex) {
    return knex.schema.alterTable('auto_trading_rules', function(table) {
      table.decimal('amount', 14, 6).notNullable().defaultTo(0);
  
      // Optional: If you haven't already added timestamps
      // table.timestamps(true, true); // created_at and updated_at with defaults
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable('auto_trading_rules', function(table) {
      table.dropColumn('amount');
  
      // If added timestamps above and want to reverse them:
      // table.dropTimestamps();
    });
  };
  