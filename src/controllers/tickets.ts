import type { NextFunction, Request, Response } from "express";
import { errors } from "../constants";
import * as ticketService from "../services/tickets";
import * as roleService from "../services/roles";
import * as projectService from "../services/projects";
import * as trackService from "../services/tracks";
import * as commentService from "../services/comments";
import * as publicTokenService from "../services/publicTokens";
import { generateEntityId, isProd } from "../utils";
import { CustomError } from "../config/errors";
import Cookies from "cookies";

const getAll = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const projectId = req.query.project_id as string;

  try {
    const { data } = await ticketService.getAll(projectId);

    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const getSingle = async (req: Request, res: Response, next: NextFunction) => {
  const ticketId = req.params.ticketId;
  const versionId = req.query.version_id as string;
  const projectId = req.query.project_id as string;

  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  try {
    const { data: project } = await projectService.getSingle(projectId);
    const { data: ticket } = await ticketService.getSingle(ticketId);

    const { data: ticketVersion } = await ticketService.getVersion(
      versionId,
      ticketId
    );

    const { data: track } = await trackService.getSingle(
      ticketId,
      ticketVersion.id
    );

    // get all track names from all versions in array format to send to supabase
    const { data: tracks } = await trackService.getAll(ticketId);
    const trackNames = tracks.map((t) => t.track_name) || [];

    const { data: allTicketVersions } = await ticketService.getAllVersions(
      ticketId
    );

    if (!ticket || !ticketService || !project) {
      const err = new CustomError(errors.RESOURCE_DOES_NOT_EXISTS);
      return next(err);
    }

    return res.status(200).json({
      ticket,
      current_version: ticketVersion,
      project,
      versions: allTicketVersions,
      track,
      track_names: trackNames,
    });
  } catch (e) {
    console.log(e, "e");
    return res.status(404).json({ errors: errors.GENERIC });
  }
};

const create = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  // TODO: add bucket implementation
  // const trackUrl = req.files.track_url || null;
  // console.log(req.files.track_url, "req.files.track_url");
  const trackUrl = req.body?.track_url !== "null" ? req.body?.track_url : "";
  const trackName = req.body?.track_name !== "null" ? req.body?.track_name : "";
  const trackSize = req.body?.track_size !== "null" ? req.body?.track_size : 0;

  const ticketId = generateEntityId("ti");
  const trackId = generateEntityId("tra");
  const versionId = generateEntityId("vrs");

  const projectId = req.body?.project_id;
  const assignee: string =
    req.body?.assignee !== "null" ? req.body?.assignee : null;
  const deadline: string =
    req.body?.deadline !== "null" ? req.body?.deadline : null;
  const status: string = req.body?.status !== "null" ? req.body?.status : null;
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
    createdBy: res.locals.user.id,
  };

  const trackPayload = {
    trackId,
    ticketId,
    projectId,
    trackUrl,
    versionId,
    trackName,
    trackSize: BigInt(trackSize),
    createdBy: res.locals.user.id,
  };

  try {
    // TODO: make this a transaction
    const { data } = await ticketService.create(payload);

    await ticketService.createVersion({ id: versionId, ticketId });

    if (trackUrl) {
      await trackService.create(trackPayload);
    }

    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

// this is used when there is an existing ticket and version but the track is missing
const uploadTrack = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  // TODO: add bucket implementation
  // const trackUrl = req.files.track_url || null;
  // console.log(req.files.track_url, "req.files.track_url");

  const trackId = generateEntityId("tra");
  const ticketId = req.params.ticketId;

  const projectId = req.body.project_id;
  const trackUrl = req.body?.track_url || "";
  const trackName = req.body?.track_name || "";
  const trackSize = req.body?.track_size || 0;
  const versionId = req.body?.version_id ?? null;

  if (!trackUrl || !versionId) {
    return res.status(404).json({ errors: errors.GENERIC });
  }

  const trackPayload = {
    trackId,
    ticketId,
    projectId,
    trackUrl,
    versionId,
    trackName,
    trackSize: BigInt(trackSize),
    createdBy: res.locals.user.id,
  };

  try {
    const data = await trackService.create(trackPayload);

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

  const projectId = req.body.project_id;

  const isAdmin = await roleService.isProjectAdmin(projectId, userId);
  if (!isAdmin) {
    return res.status(404).json({ errors: errors.USER_NOT_ADMIN });
  }

  const { data: ticket } = await ticketService.getSingle(ticketId);

  const assignee: string = req.body?.assignee ?? ticket.assignee;
  const deadline: string = req.body?.deadline ?? ticket.deadline;
  const status: string =
    req.body?.status === "no_status"
      ? null
      : req.body?.status ?? ticket.ticket_status;
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
  const projectId = req.query.project_id as string;

  const isAdmin = await roleService.isProjectAdmin(projectId, userId);

  if (!isAdmin) {
    return res.status(404).json({ errors: errors.USER_NOT_ADMIN });
  }

  try {
    const { data } = await ticketService.deleteTicket(ticketId);
    await commentService.deleteManyComments(ticketId);

    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const getAllVersions = async (req: Request, res: Response) => {
  if (!res.locals.user && !res.locals.anon_user_id) {
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

  const versionId = generateEntityId("vrs");
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
  const projectId = req.query.project_id as string;

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

    let error: { message: string; error_code: string };
    if (e instanceof CustomError) {
      error = { message: e.message, error_code: e.error_code };
    } else {
      error = errors.GENERIC;
    }

    return res.status(404).json({ errors: error });
  }
};

//
////
//////
//////// PUBLIC
//////
////
//

const getPublicSingle = async (req: Request, res: Response) => {
  const cookies = new Cookies(req, res, {});
  const token = req.params.token;
  const versionId = req.query.version_id as string;

  try {
    const { data: publicTokenPage } = await publicTokenService.getSingleByToken(
      token
    );
    if (!publicTokenPage || !publicTokenPage.metadata.enabled) {
      return res
        .status(404)
        .json({ errors: errors.PUBLIC_PAGE_DOES_NOT_EXIST });
    }

    const ticketId = publicTokenPage.resource_id;
    const { data: ticket } = await ticketService.getSingle(ticketId);

    const { data: ticketVersion } = await ticketService.getVersion(
      versionId,
      ticketId
    );

    const { data: track } = await trackService.getSingle(
      ticketId,
      ticketVersion.id
    );

    const { data: tracks } = await trackService.getAll(ticketId);
    const trackNames = tracks.map((t) => t.track_name) || [];

    const { data: allTicketVersions } = await ticketService.getAllVersions(
      ticketId
    );

    const anonUserId = cookies.get("sd_auid");
    if (!anonUserId) {
      const newAnonId = generateEntityId("anon");
      cookies.set("sd_auid", newAnonId, {
        secure: isProd(),
        maxAge: 24 * 60 * 60 * 1000,
      });
    }

    return res.status(200).json({
      ticket,
      current_version: ticketVersion,
      versions: allTicketVersions,
      track,
      track_names: trackNames,
      public_data: {
        metadata: publicTokenPage.metadata,
      },
    });
  } catch (e) {
    console.log(e, "e");
    return res.status(404).json({ errors: errors.GENERIC });
  }
};

export {
  getAll,
  getSingle,
  create,
  uploadTrack,
  update,
  del,
  getAllVersions,
  getSingleVersion,
  createVersion,
  deleteVersion,
  getPublicSingle,
};
