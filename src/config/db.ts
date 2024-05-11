import * as pg from "pg";
const { Pool } = pg.default;

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
}

export interface DatabaseProject {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
}

export interface DatabaseRole {
  id: string;
  role: string;
  role_type: string;
  user_id: string;
  project_id: string;
  created_at: Date;
}

export interface DatabaseInvitation {
  id: string;
  created_at: Date;
  invited_email: string;
  role: string;
  has_account: boolean;
  role_type: string;
  invited_by: string;
  project_id: string;
  invitation_status: string;
}

export interface DatabaseTicket {
  id: string;
  // username: string;
  // password: string;
  // email: string;
  // first_name: string;
  // last_name: string;
}
