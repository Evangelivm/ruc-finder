import mysql, { PoolOptions } from "mysql2/promise";

const access: PoolOptions = {
  host: process.env.DB_HOST || process.env.HOST_NAME || "localhost",
  user: process.env.DB_USER || "root",
  database: process.env.DB_NAME || "database",
  password: process.env.DB_PASS || process.env.DB_PASSWORD || "",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
};

export const conn = mysql.createPool(access);
