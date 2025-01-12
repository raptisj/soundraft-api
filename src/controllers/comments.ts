import type { Request, Response } from "express";
import { errors } from "../constants";
import * as commentService from "../services/comments";
import { generateEntityId } from "../utils";
import { logger } from "../utils/logger";

const getAll = async (req: Request, res: Response) => {
  const ticketId = req.params.ticketId;
  const ticketVersionId = req.query.ticket_version_id as string;

  if (!res.locals.user && !res.locals.anon_user_id) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  try {
    const { data: comments } = await commentService.getAll(
      ticketId,
      ticketVersionId
    );

    // TODO: find a better way to do this
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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

  if (!res.locals.user && !res.locals.anon_user_id) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const userId = res.locals?.user?.id || res.locals.anon_user_id;

  // comment body
  const commentId = generateEntityId("com");
  const trackId = req.body?.track_id || "";
  const ticketVersionId = req.body?.ticket_version_id || "";
  const content = req.body?.content || "";
  const parentCommentId = req.body?.parent_comment_id || null;

  // region body
  const regionId = generateEntityId("reg");
  const regionIndex = req.body?.region_index || null;
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
    const { data: comment } = await commentService.create(payload);

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
  if (!res.locals.user && !res.locals.anon_user_id) {
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
    const { data: comment } = await commentService.update(payload);

    const response = {
      ...comment,
      region: null,
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
  if (!res.locals.user && !res.locals.anon_user_id) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const commentId = req.params.commentId;

  const regionId = (req.query?.region_id as string) || null;

  try {
    if (regionId) {
      await commentService.deleteRegion(regionId);
    }
    await commentService.deleteComment(commentId);
    return res.status(200).json({});
  } catch (e) {
    logger.error({ error: e }, "error in deleting comment");
    return res.status(404).end();
  }
};

export { create, update, del, getAll };
