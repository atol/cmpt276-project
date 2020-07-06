const { Pool } = require('pg');
var pool = new Pool({
  //connectionString: process.env.DATABASE_URL
  connectionString: 'postgres://postgres:root@localhost/authdb',
})

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
}
/*
module.exports = { //picked up statement off of node-postgres guide
  query: (text, params, callback) => {
    const start = Date.now()
    return pool.query(text, params, (err, res) => {
      const duration = Date.now() - start
      console.log('executed query', { text, duration, rows: res.rowCount })
      callback(err, res)
    })
  }
}*/