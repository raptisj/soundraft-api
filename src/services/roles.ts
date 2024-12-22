import { generateEntityId } from "../utils";
import { db } from "../config/db";

export const createRole = async (
  role: string,
  userId: string,
  projectId: string
) => {
  const roleId = generateEntityId("rol");

  const results = await db.query(
    "INSERT INTO roles (id, role, role_type, user_id, project_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW())",
    [roleId, role, "project", userId, projectId]
  );

  return {
    data: results?.rows[0],
  };
};

export const deleteRole = async (memberId: string) => {
  await db.query("DELETE FROM roles WHERE id = $1;", [memberId]);

  return {};
};

export const getRole = async (memberId: string, projectId: string) => {
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

export const update = async (roleId: string, role: string) => {
  const results = await db.query(
    "UPDATE roles SET role = $2 WHERE id = $1 RETURNING *;",
    [roleId, role]
  );

  return {
    data: results?.rows[0],
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
