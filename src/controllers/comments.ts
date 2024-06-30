import { Request, Response } from "express";
import { errors } from "../constants/index.ts";
import * as commentService from "../services/comments.ts";
import { generateEntityId } from "../utils/index.ts";

const getAll = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const ticketId = req.params.ticketId;
  const ticketVersionId: any = req.query.ticket_version_id;
  const trackId: any = req.query.track_id;

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

    return res.status(200).json(sanitizeResponse);
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
  // "d6wh57t56am1ajw" is toto
  const ticketId = req.params.ticketId;

  // comment body
  const commentId = generateEntityId("comment");
  const trackId = req.body?.track_id || null;
  const ticketVersionId = req.body?.ticket_version_id || null;
  const content = req.body?.content || "";
  const parentCommentId = req.body?.parent_comment_id || null;

  // region body
  const regionId = generateEntityId("region");
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
    let response = {
      ...comment,
      region: null,
    } as any;

    if (startInt && endInt) {
      const { data: region } = await commentService.createRegion(regionPayload);
      response.region = region;
    }
    console.log(response, "response");
    return res.status(200).json(response);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

export { create, getAll };
