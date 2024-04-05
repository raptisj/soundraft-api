import { db } from "../config/db.ts";

export const createRole = async (
  roleId: string,
  userId: string,
  projectId: string
): Promise<any> => {
  // const results = await db.query(
  //   `SELECT p.*, json_agg(json_build_object(
  //     'user_id', u.id,
  //     'username', u.username,
  //     'email', u.email,
  //     'first_name', u.first_name,
  //     'last_name', u.last_name,
  //     'role', roles.role,
  //     'role_id', roles.id,
  //     'role_type', roles.role_type,
  //     'role_created_at', roles.created_at
  //     ))
  //   AS members
  //   FROM projects p
  //   INNER JOIN roles ON p.id = roles.project_id
  //   INNER JOIN users u ON roles.user_id = u.id
  //   WHERE p.id = $1
  //   GROUP BY p.id;`,
  //   [id]
  // );

  const results = await db.query(
    "INSERT INTO roles (id, role, role_type, user_id, project_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW())",
    [roleId, "admin", "project", userId, projectId]
  );

  return {
    data: results?.rows[0],
  };
};
