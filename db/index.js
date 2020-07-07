const { Pool } = require('pg');
var pool = new Pool({
  connectionString: process.env.DATABASE_URL
  //connectionString: 'postgres://postgres:root@localhost/authdb',
})

exports.pool = pool