import { Request, Response } from "express";
import { db } from "../config/db.ts";
import { v4 as uuidv4 } from "uuid";

const getAll = async (req: Request, res: Response) => {
  // check auth
  //
  // get projects current user participates
};

const getSingle = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).end();
  }

  const id = req.params.id;

  try {
    const result = await db.query(
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

    const project = result?.rows[0];

    return res.status(200).json({ project });
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const create = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).end();
  }
  const userId = res.locals.user.id;

  const projectId = uuidv4();
  const roleId = uuidv4();

  const name: string = req.body?.name;
  const description: string = req.body?.description ?? "";
  if (!name) {
    return res.status(404).send("Name field is mandatory");
  }

  try {
    const projectResult = await db.query(
      "INSERT INTO projects (id, name, description, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [projectId, name, description]
    );
    const newProject = projectResult?.rows[0];

    // create admin role
    await db.query(
      "INSERT INTO roles (id, role, role_type, user_id, project_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW())",
      [roleId, "admin", "project", userId, newProject.id]
    );

    return res.status(200).json({ newProject });
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const update = async (req: Request, res: Response) => {
  // check auth
  //
  // const results = await db.query(
  //   "UPDATE  SET username = $2, first_name = $3, last_name = $4 WHERE id = $1 RETURNING *",
  //   [userId, username, firstName, lastName]
  // );
  // check permission if user can update project
  //
  // update project
};

const del = async (req: Request, res: Response) => {
  // check auth
  //
  // check permission if user can delete project
  //
  // delete project
  //
  // delete tickets
};

export { getAll, getSingle, create, update, del };
