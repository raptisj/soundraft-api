import type { Request, Response } from "express";
import { errors } from "../constants";
import * as projectService from "../services/projects";
import * as roleService from "../services/roles";
import * as ticketService from "../services/tickets";

const getAll = async (_: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }
  const userId = res.locals.user.id;

  try {
    const { data } = await projectService.getAll(userId);

    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const getSingle = async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const { data: project } = await projectService.getSingle(id);
    const { data: tickets } = await ticketService.getAll(id);

    return res.status(200).json({ project, tickets });
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

  try {
    // TODO: make this a transaction
    const { data, error } = await projectService.create(req.body);
    if (error) {
      return res.status(404).json({ errors: error });
    }

    await roleService.createRole("admin", userId, data.id);

    return res.status(200).json(data);
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

  const isAdmin = await roleService.isProjectAdmin(id, userId);

  if (!isAdmin) {
    return res.status(404).json({ errors: errors.USER_NOT_ADMIN });
  }

  const { data: projectData } = await projectService.getSingle(id);

  const name: string = req.body?.name ?? projectData.name;
  const projectStatus: string =
    req.body?.project_status ?? projectData.project_status;
  const description: string =
    req.body?.description ?? projectData.description ?? "";
  const accessType: string = req.body?.access_type ?? projectData.access_type;

  try {
    const { data } = await projectService.update(
      id,
      name,
      description,
      projectStatus,
      userId,
      accessType
    );

    return res.status(200).json(data);
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

  const isAdmin = await roleService.isProjectAdmin(id, userId);

  if (!isAdmin) {
    return res.status(404).json({ errors: errors.USER_NOT_ADMIN });
  }

  try {
    const { data } = await projectService.deleteProject(id);

    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const removeMember = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const userId = res.locals.user.id;
  const memberId = req.body?.member_id;
  const projectId = req.params.id;

  const userRole = await roleService.getRole(userId, projectId);

  if (!userRole.isAdmin()) {
    console.log("User is not admin");
    return res.status(404).json({ errors: errors.USER_NOT_ADMIN });
  }

  try {
    await roleService.removeFromProject(memberId, projectId);

    return res.status(201).json({});
  } catch (e) {
    console.log(e, "e");
    return res.status(400).json({ errors: errors.GENERIC });
  }
};

export { getAll, getSingle, create, update, del, removeMember };
