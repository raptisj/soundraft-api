import { generateEntityId } from "../utils/index.ts";
import { db } from "../config/db.ts";
import { errors } from "../constants/index.ts";

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
    INNER JOIN roles project_roles ON p.id = project_roles.project_id AND project_roles.user_id = $1
    GROUP BY p.id 
    ORDER BY created_at DESC;`,
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

type CreateProjectProps = {
  name: string;
  description?: string;
};

export const create = async (
  payload: CreateProjectProps
): Promise<{ data: any; error: any }> => {
  const { name, description = "" } = payload;
  const projectId = generateEntityId("pr");

  if (!name) {
    return {
      data: null,
      error: errors.REQUIRED_PROJECT_NAME,
    };
  }

  // abstract this away
  const results = await db.query(
    "INSERT INTO projects (id, name, description, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
    [projectId, name, description]
  );

  return {
    data: results?.rows[0], // here mapper/dto ???
    error: null,
  };
};

export const update = async (
  id: string,
  name: string,
  description: string,
  projectStatus: string,
  userId: string
): Promise<any> => {
  const results = await db.query(
    `UPDATE projects p SET name = $2, description = $3, project_status = $4
      WHERE p.id = $1
      AND EXISTS (  
      SELECT 1
      FROM roles
      INNER JOIN users u ON roles.user_id = u.id
      WHERE roles.project_id = $1
        AND u.id = $5
        AND roles.role = 'admin'
    ) RETURNING *;`,
    [id, name, description, projectStatus, userId]
  );

  return {
    data: results?.rows[0],
  };
};

export const deleteProject = async (id: string) => {
  try {
    await db.query(`DELETE FROM projects WHERE id = $1;`, [id]);
  } catch (error) {
    throw new Error();
  }

  return {
    data: {},
  };
};
