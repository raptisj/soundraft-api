import { Request, Response } from "express";
import { db } from "../config/db.ts";
import { v4 as uuidv4 } from "uuid";
import { errors } from "../constants/index.ts";
import * as projectServices from "../services/projects.ts";
import * as roleServices from "../services/roles.ts";

const getAll = async (_: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }
  const userId = res.locals.user.id;

  try {
    const { data } = await projectServices.getAll(userId);

    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const getSingle = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const id = req.params.id;

  try {
    const { data } = await projectServices.getSingle(id);

    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const create = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }
  const userId = res.locals.user.id;

  const projectId = uuidv4();
  const roleId = uuidv4();

  const name: string = req.body?.name;
  const description: string = req.body?.description ?? "";
  if (!name) {
    return res.status(404).json({ errors: errors.REQUIRED_PROJECT_NAME });
  }

  try {
    // const projectResult = await db.query(
    //   "INSERT INTO projects (id, name, description, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
    //   [projectId, name, description]
    // );
    // const newProject = projectResult?.rows[0];
    const { data: newProject } = await projectServices.create(
      projectId,
      name,
      description
    );

    // create admin role
    // await db.query(
    //   "INSERT INTO roles (id, role, role_type, user_id, project_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW())",
    //   [roleId, "admin", "project", userId, newProject.id]
    // );

    await roleServices.createRole(roleId, userId, newProject.id);

    return res.status(200).json({ newProject });
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const update = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const userId = res.locals.user.id;
  const id = req.params.id;

  const project = await db.query("SELECT * FROM projects WHERE id = $1", [id]);

  const projectData = project?.rows[0];

  const name: string = req.body?.name ?? projectData.name;
  const description: string =
    req.body?.description ?? projectData.description ?? "";

  try {
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

    const updatedProject = results?.rows[0];

    return res.status(200).json({ updatedProject });
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const del = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const userId = res.locals.user.id;
  const id = req.params.id;
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

    return res.status(200).json({});
  } catch (e) {
    await client.query("ROLLBACK");
    console.log(e, "e");
    return res.status(404).end();
  } finally {
    client.release();
  }
};

export { getAll, getSingle, create, update, del };
