exports.up = function (knex) {
    return knex.schema.table('users', function (table) {
      table.boolean('is_email_verified').defaultTo(false);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.table('users', function (table) {
      table.dropColumn('is_email_verified');
    });
  };
  

  //c63869d588b9dca9f478bc2d27934cdb126786a1da1c9d9af3ad0ca53d914ae0