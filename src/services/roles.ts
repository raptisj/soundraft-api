import { db } from "../config/db.ts";

export const createRole = async (
  roleId: string,
  role: string,
  userId: string,
  projectId: string
): Promise<any> => {
  const results = await db.query(
    "INSERT INTO roles (id, role, role_type, user_id, project_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW())",
    [roleId, role, "project", userId, projectId]
  );

  return {
    data: results?.rows[0],
  };
};

export const removeFromProject = async (
  memberId: string,
  projectId: string
): Promise<any> => {
  await db.query("DELETE FROM roles WHERE user_id = $1 AND project_id = $2;", [
    memberId,
    projectId,
  ]);

  return {};
};
