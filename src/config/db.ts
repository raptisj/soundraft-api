import { Pool } from "pg";

const db = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: Number(process.env.DATABASE_PORT),
});

export { db };

export interface DatabaseUser {
  id: string;
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}
