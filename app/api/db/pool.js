const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  password: process.env.PGPASSWORD || "root",
  port: process.env.PGPORT || "5432",
  database: process.env.PGDATABASE || "postgres",
});

module.exports = pool;
