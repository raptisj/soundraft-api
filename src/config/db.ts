import pg from "pg";
import { isProd } from "../utils";
const { Pool } = pg;

const sslProdOptions = {
  rejectUnauthorized: true,
  ca: process.env.DATABASE_CA_CERT,
};

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProd() ? sslProdOptions : false,
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
  created_at: Date;
  project_id: string;
  title: string;
  description?: string;
  ticket_status?: string | null;
  latest_version_id?: string;
  deadline?: Date;
  assignee?: string | null;
}

export interface DatabaseTicketVersion {
  id: string;
  created_at: Date;
  ticket_id: string;
  notes?: string;
  name: string;
}
