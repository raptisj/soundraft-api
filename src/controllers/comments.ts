import { Request, Response } from "express";
import { errors } from "../constants/index.ts";
import * as commentService from "../services/comments.ts";
import * as projectService from "../services/projects.ts";
import { generateEntityId } from "../utils/index.ts";
import { logger } from "../utils/logger.ts";

const getAll = async (req: Request, res: Response) => {
  const ticketId = req.params.ticketId;
  const ticketVersionId: any = req.query.ticket_version_id;
  const trackId: any = req.query.track_id;
  const projectId = req.params.projectId;

  const { data: access } = await projectService.accessProject(projectId);

  if (!res.locals.user && access.access_type === "limited") {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  try {
    const { data: comments, error } = await commentService.getAll(
      ticketId,
      ticketVersionId,
      trackId
    );
    if (error) {
      return res.status(404).json({ errors: error });
    }

    // TODO: find a better way to doo this
    const sanitizeResponse = comments.map((c: any) => {
      if (!c.region.id) {
        return { ...c, region: null };
      }

      return c;
    });

    return res.status(200).json({ comments: sanitizeResponse });
  } catch (e) {
    logger.error({ error: e }, "error in fetching all comments");
    return res.status(404).end();
  }
};

const create = async (req: Request, res: Response) => {
  const ticketId = req.params.ticketId;
  const projectId = req.params.projectId;

  const { data: access } = await projectService.accessProject(projectId);

  if (!res.locals.user && access.access_type === "limited") {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const userId = res.locals?.user?.id || "0";

  // comment body
  const commentId = generateEntityId("com");
  const trackId = req.body?.track_id || null;
  const ticketVersionId = req.body?.ticket_version_id || null;
  const content = req.body?.content || "";
  const parentCommentId = req.body?.parent_comment_id || null;

  // region body
  const regionId = generateEntityId("reg");
  const regionIndex = req.body?.region_index || null;
  const startString = req.body?.start_string || null;
  const endString = req.body?.end_string || null;
  const startInt = req.body?.start_int || null;
  const endInt = req.body?.end_int || null;

  if (!trackId || !ticketVersionId || !content) {
    return res.status(404).json({ errors: errors.GENERIC });
  }

  const payload = {
    commentId,
    ticketId,
    userId,
    trackId,
    ticketVersionId,
    content,
    parentCommentId,
  };

  const regionPayload = {
    regionId,
    commentId,
    regionIndex,
    startString,
    endString,
    startInt,
    endInt,
  };

  try {
    const { data: comment, error } = await commentService.create(payload);
    if (error) {
      return res.status(404).json({ errors: error });
    }
    const response = {
      ...comment,
      region: null,
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } as any;

    if (startInt && endInt) {
      const { data: region } = await commentService.createRegion(regionPayload);
      response.region = region;
    }

    return res.status(200).json(response);
  } catch (e) {
    logger.error({ error: e }, "error in creating comment");
    return res.status(404).end();
  }
};

const update = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const ticketId = req.params.ticketId;
  const commentId = req.params.commentId;

  const ticketVersionId = req.body?.ticket_version_id || null;
  const content = req.body?.content || "";

  const regionId = req.body?.region_id || null;
  const startString = req.body?.start_string || null;
  const endString = req.body?.end_string || null;
  const startInt = req.body?.start_int || null;
  const endInt = req.body?.end_int || null;

  if (!ticketVersionId || !content) {
    return res.status(404).json({ errors: errors.GENERIC });
  }

  const payload = {
    commentId,
    ticketId,
    ticketVersionId,
    content,
  };

  const regionPayload = {
    regionId,
    commentId,
    startString,
    endString,
    startInt,
    endInt,
  };

  try {
    const { data: comment, error } = await commentService.update(payload);
    if (error) {
      return res.status(404).json({ errors: error });
    }
    let response = {
      ...comment,
      region: null,
    } as any;

    if (regionId && startInt && endInt) {
      const { data: region } = await commentService.updateRegion(regionPayload);
      response.region = region;
    }

    return res.status(200).json(response);
  } catch (e) {
    logger.error({ error: e }, "error in updating comment");
    return res.status(404).end();
  }
};

const del = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const commentId = req.params.commentId;

  const regionId: any = req.query?.region_id || null;

  const payload = { commentId };

  try {
    if (regionId) {
      await commentService.deleteRegion(regionId);
    }
    await commentService.deleteComment(payload);
    return res.status(200).json({});
  } catch (e) {
    logger.error({ error: e }, "error in deleting comment");
    return res.status(404).end();
  }
};

export { create, update, del, getAll };
