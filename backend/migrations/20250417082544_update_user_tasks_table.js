exports.up = function(knex) {
    return knex.schema.alterTable('user_tasks', function(table) {
      table.renameColumn('task_name', 'task_type');  // rename task_name -> task_type
      table.integer('goal').defaultTo(0);             // add goal column, default 0 (or you can make it notNullable)
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable('user_tasks', function(table) {
      table.renameColumn('task_type', 'task_name');   // rollback: rename back
      table.dropColumn('goal');                       // rollback: remove goal
    });
  };