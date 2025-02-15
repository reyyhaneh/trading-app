exports.up = function (knex) {
    return knex.schema.createTable('user_tasks', function (table) {
      table.increments('id').primary(); // Auto-incrementing ID
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('task_name').notNullable();
      table.integer('progress').defaultTo(0); // Progress (0 to 100)
      table.boolean('completed').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists('user_tasks');
  };
  