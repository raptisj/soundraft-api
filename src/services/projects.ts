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
    INNER JOIN roles project_roles ON p.id = project_roles.project_id AND project_roles.user_id = $1
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

export const update = async (
  id: string,
  name: string,
  description: string,
  userId: string
): Promise<any> => {
  const results = await db.query(
    `UPDATE projects p SET name = $2, description = $3
      WHERE p.id = $1
      AND EXISTS (  
      SELECT 1
      FROM roles
      INNER JOIN users u ON roles.user_id = u.id
      WHERE roles.project_id = $1
        AND u.id = $4
        AND roles.role = 'admin'
    ) RETURNING *;`,
    [id, name, description, userId]
  );

  return {
    data: results?.rows[0],
  };
};

export const deleteProject = async (id: string, userId: string) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `DELETE FROM projects
        WHERE id = $1
        AND EXISTS (
        SELECT 1
        FROM roles
        INNER JOIN users u ON roles.user_id = u.id
        WHERE roles.project_id = $1
          AND u.id = $2
          AND roles.role = 'admin'
        );`,
      [id, userId]
    );
    await client.query(`DELETE FROM roles WHERE project_id = $1;`, [id]);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw new Error();
  } finally {
    client.release();
  }

  return {
    data: {},
  };
};
