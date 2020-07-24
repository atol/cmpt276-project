const { Pool } = require('pg');
var pool = new Pool({
  connectionString: process.env.DATABASE_URL
   //connectionString: 'postgres://postgres:zandox99@localhost/person',
})

exports.pool = pool
