import { db } from "../config/db.ts";

export const getAll = async (userId: string): Promise<any> => {
  const results = await db.query(
    `SELECT p.*, json_agg(json_build_object(
      'user_id', u.id,
      'username', u.username,
      'email', u.email,
      'first_name', u.first_name,
      'last_name', u.last_name,
      'role', roles.role,
      'role_id', roles.id,
      'role_type', roles.role_type,
      'role_created_at', roles.created_at
      )) 
    AS members
    FROM projects p
    INNER JOIN roles ON p.id = roles.project_id
    INNER JOIN users u ON roles.user_id = u.id
    WHERE roles.user_id = $1 
    GROUP BY p.id;`,
    [userId]
  );

  return {
    data: results.rows,
  };
};

export const getSingle = async (id: string): Promise<any> => {
  const results = await db.query(
    `SELECT p.*, json_agg(json_build_object(
      'user_id', u.id,
      'username', u.username,
      'email', u.email,
      'first_name', u.first_name,
      'last_name', u.last_name,
      'role', roles.role,
      'role_id', roles.id,
      'role_type', roles.role_type,
      'role_created_at', roles.created_at
      )) 
    AS members
    FROM projects p
    INNER JOIN roles ON p.id = roles.project_id
    INNER JOIN users u ON roles.user_id = u.id
    WHERE p.id = $1
    GROUP BY p.id;`,
    [id]
  );

  return {
    data: results?.rows[0],
  };
};

export const create = async (
  projectId: string,
  name: string,
  description: string
): Promise<any> => {
  const results = await db.query(
    "INSERT INTO projects (id, name, description, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
    [projectId, name, description]
  );

  return {
    data: results?.rows[0],
  };
};
