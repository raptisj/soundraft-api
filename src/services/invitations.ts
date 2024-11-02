import { db } from "../config/db";
import { isProd } from "../utils";

// type Invitation = {
//   id: string;
//   invited_email: string;
//   role: string;
//   // has_account: boolean;
//   role_type: string;
//   invited_by: string;
//   status: string;
//   project_id: string;
// };

export const create = async (payload: any): Promise<any> => {
  const {
    id,
    invited_email,
    role,
    has_account = false,
    role_type,
    invited_by,
    invitation_status,
    project_id,
  } = payload;

  const results = await db.query(
    "INSERT INTO invitations (id, invited_email, role, has_account, role_type, invited_by, invitation_status, project_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *;",
    [
      id,
      invited_email,
      role,
      has_account,
      role_type,
      invited_by,
      invitation_status,
      project_id,
    ]
  );

  return {
    data: results?.rows[0],
  };
};

export const send = async (payload: any): Promise<any> => {
  const { id, has_account, invited_email, role, project_id } = payload;

  const inviteToken = btoa(
    JSON.stringify({ id, has_account, invited_email, role, project_id })
  );

  const URL = isProd() ? process.env.PROD_API_URL : process.env.LOCAL_API_URL;

  // TODO: add process.env.CLIENT_APP_URL;
  const url = `${URL}/auth/accept-invitation/?invitation_token=${inviteToken}`;
  console.log(url, "url in email");

  return {};
};

export const get = async (inviteToken: string): Promise<any> => {
  const decodedInvitation = JSON.parse(atob(inviteToken));
  const { id } = decodedInvitation;

  const results = await db.query("SELECT * FROM invitations WHERE id = $1;", [
    id,
  ]);

  // const url = `http://localhost:3000/auth/accept-invitation/${inviteToken}`;
  // console.log(url, "url in email");

  return {
    data: results?.rows[0],
  };
};

export const accept = async (invitationId: string): Promise<any> => {
  await db.query(
    "UPDATE invitations SET invitation_status = $2, has_account = TRUE WHERE id = $1 RETURNING *;",
    [invitationId, "accepted"]
  );

  return {};
};

export const getList = async (projectId: string): Promise<any> => {
  const results = await db.query(
    "SELECT * FROM invitations WHERE project_id = $1 AND invitation_status = $2;",
    [projectId, "pending"]
  );

  return {
    data: results?.rows,
  };
};

export const revoke = async (id: string) => {
  try {
    await db.query("DELETE FROM invitations WHERE id = $1;", [id]);
  } catch (error) {
    throw new Error();
  }

  return {
    data: {},
  };
};
