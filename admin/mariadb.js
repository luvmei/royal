const mariadb = require('mariadb');
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  connectionLimit: 50,
});

let sqlFormat = { language: 'sql', indent: '  ' };

module.exports = { pool, sqlFormat };
