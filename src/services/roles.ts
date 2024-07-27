import { generateEntityId } from "../utils/index.ts";
import { db } from "../config/db.ts";

export const createRole = async (
  role: string,
  userId: string,
  projectId: string
): Promise<any> => {
  const roleId = generateEntityId("rol");

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

export const getRole = async (
  memberId: string,
  projectId: string
): Promise<any> => {
  const userRoleResult = await db.query(
    "SELECT * FROM roles WHERE user_id = $1 AND project_id = $2;",
    [memberId, projectId]
  );

  const userRole = userRoleResult?.rows[0];

  const isAdmin = () => {
    return userRole?.role === "admin";
  };

  return {
    role: userRole,
    isAdmin,
  };
};

export const isProjectAdmin = async (id: string, userId: string) => {
  try {
    const results = await db.query(
      "SELECT role FROM roles WHERE project_id = $1 AND user_id = $2;",
      [id, userId]
    );

    return results?.rows[0].role === "admin";
  } catch (e) {
    throw new Error();
  }
};
