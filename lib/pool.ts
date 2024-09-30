import pg from "pg";

const pool = new pg.Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  password: process.env.PGPASSWORD || "root",
  port: parseInt(process.env.PGPORT || "5432"),
  database: process.env.PGDATABASE || "postgres",
});

export default pool;
