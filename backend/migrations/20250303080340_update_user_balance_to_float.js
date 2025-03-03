exports.up = function (knex) {
    return knex.schema.alterTable('users', function (table) {
      table.float('balance', 8).alter(); // Change balance to FLOAT(8)
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable('users', function (table) {
      table.decimal('balance', 18, 8).alter(); // Rollback to decimal if needed
    });
  };
  