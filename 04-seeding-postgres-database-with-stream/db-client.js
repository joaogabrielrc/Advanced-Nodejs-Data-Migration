import pg from "pg";

export default new pg.Client({
  user: "user",
  host: "localhost",
  database: "vendas_db",
  password: "password",
  port: 5432,
});
