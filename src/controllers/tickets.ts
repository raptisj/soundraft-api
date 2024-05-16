import { NextFunction, Request, Response } from "express";
import { errors } from "../constants/index.ts";
import * as ticketService from "../services/tickets.ts";
import * as roleService from "../services/roles.ts";
import * as projectService from "../services/projects.ts";
import { getGeneratedId } from "../utils/index.ts";
import { CustomError } from "../config/errors.ts";

const getAll = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const projectId = req.params.projectId;

  try {
    const { data } = await ticketService.getAll(projectId);

    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const getSingle = async (req: Request, res: Response, next: NextFunction) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const ticketId = req.params.ticketId;
  const projectId = req.params.projectId;
  const versionId: any = req.query.version_id;

  try {
    const { data: project } = await projectService.getSingle(projectId);
    const { data: ticket } = await ticketService.getSingle(ticketId);

    const { data: ticketVersion } = await ticketService.getVersion(
      versionId,
      ticketId
    );

    const { data: allTicketVersions } = await ticketService.getAllVersions(
      ticketId
    );

    if (!ticket || !ticketService || !project) {
      const err = new CustomError(errors.RESOURCE_DOES_NOT_EXISTS);
      return next(err);
    }

    return res
      .status(200)
      .json({ ticket, ticketVersion, project, allTicketVersions }); // comments ???
  } catch (e) {
    console.log(e, "e");
    return res.status(404).json({ errors: errors.GENERIC });
  }
};

const create = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const ticketId = getGeneratedId();
  const versionId = getGeneratedId();
  const projectId = req.params.projectId;

  const assignee: string = req.body?.assignee ?? "unassigned"; // user id
  const deadline: string = req.body?.deadline ?? null;
  const status: string = req.body?.status ?? "no_status";
  const title: string = req.body?.title;
  const description: string = req.body?.description ?? "";

  const payload = {
    ticketId,
    projectId,
    assignee,
    deadline,
    status,
    title,
    description,
  };

  try {
    // TODO: make this a transaction
    const { data } = await ticketService.create(payload);

    await ticketService.createVersion({ id: versionId, ticketId });

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
  const ticketId = req.params.ticketId;
  const projectId = req.params.projectId;

  const isAdmin = await roleService.isProjectAdmin(projectId, userId);
  if (!isAdmin) {
    return res.status(404).json({ errors: errors.USER_NOT_ADMIN });
  }

  const { data: ticket } = await ticketService.getSingle(ticketId);

  const assignee: string = req.body?.assignee ?? ticket.assignee;
  const deadline: string = req.body?.deadline ?? ticket.deadline;
  const status: string = req.body?.status ?? ticket.status;
  const title: string = req.body?.title ?? ticket.title;
  const description: string = req.body?.description ?? ticket.description;

  const payload = {
    assignee,
    deadline,
    status,
    title,
    description,
  };

  try {
    const { data } = await ticketService.update(ticketId, payload);

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
  const ticketId = req.params.ticketId;
  const projectId = req.params.projectId;
  const isAdmin = await roleService.isProjectAdmin(projectId, userId);

  if (!isAdmin) {
    return res.status(404).json({ errors: errors.USER_NOT_ADMIN });
  }

  try {
    const { data } = await ticketService.deleteTicket(ticketId);

    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const getAllVersions = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const ticketId = req.params.ticketId;

  try {
    const { data } = await ticketService.getAllVersions(ticketId);

    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const getSingleVersion = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const ticketId = req.params.ticketId;
  const versionId = req.params.versionId;

  try {
    const { data } = await ticketService.getVersion(versionId, ticketId);

    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).json({ errors: errors.GENERIC });
  }
};

const createVersion = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const versionId = getGeneratedId();
  const ticketId = req.params.ticketId;
  const versionName: string = req.body?.version_name ?? "";
  const versionNotes: string = req.body?.notes ?? "";

  try {
    const { data } = await ticketService.createVersion({
      id: versionId,
      ticketId,
      name: versionName,
      notes: versionNotes,
    });

    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const deleteVersion = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const userId = res.locals.user.id;
  const ticketId = req.params.ticketId;
  const versionId = req.params.versionId;
  const projectId = req.params.projectId;
  const isAdmin = await roleService.isProjectAdmin(projectId, userId);

  if (!isAdmin) {
    return res.status(404).json({ errors: errors.USER_NOT_ADMIN });
  }

  try {
    const { data } = await ticketService.deleteTicketVersion(
      ticketId,
      versionId
    );

    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");

    let error;
    if (e instanceof CustomError) {
      error = { message: e.message, error_code: e.error_code };
    } else {
      error = errors.GENERIC;
    }

    return res.status(404).json({ errors: error });
  }
};

export {
  getAll,
  getSingle,
  create,
  update,
  del,
  getAllVersions,
  getSingleVersion,
  createVersion,
  deleteVersion,
};
