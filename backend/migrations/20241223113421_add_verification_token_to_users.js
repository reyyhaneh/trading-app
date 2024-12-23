exports.up = function (knex) {
    return knex.schema.table('users', function (table) {
      table.string('verification_token', 255).nullable();
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.table('users', function (table) {
      table.dropColumn('verification_token');
    });
  };
  