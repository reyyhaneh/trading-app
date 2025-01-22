exports.up = function (knex) {
    return knex.schema.table('users', (table) => {
      table.decimal('balance', 12, 2).defaultTo(10000);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.table('users', (table) => {
      table.dropColumn('balance');
    });
  };
  