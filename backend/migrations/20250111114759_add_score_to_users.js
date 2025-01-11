exports.up = function(knex) {
    return knex.schema.table('users', function(table) {
      table.integer('score').defaultTo(0); // Default score is 0
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('users', function(table) {
      table.dropColumn('score');
    });
  };
  