import type { Request, Response } from "express";
import { errors } from "../constants";
import * as reactionService from "../services/reactions";
import { generateEntityId } from "../utils";

const getAll = async (req: Request, res: Response) => {
  const ticketId = req.query.ticket_id as string;
  const ticketVersionId = req.query.ticket_version_id as string;

  if (!res.locals.user && !res.locals.anon_user_id) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  try {
    const { data: reactions } = await reactionService.getAll(
      ticketId,
      ticketVersionId
    );

    return res.status(200).json({ reactions });
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const create = async (req: Request, res: Response) => {
  if (!res.locals.user && !res.locals.anon_user_id) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }
  const userId = res.locals?.user?.id || res.locals.anon_user_id;
  const reactionId = generateEntityId("rct");

  const commentId = req.body?.comment_id;
  const ticketVersionId = req.body?.ticket_version_id;
  const ticketId = req.body?.ticket_id;
  const content = req.body?.content;

  const payload = {
    reactionId,
    userId,
    commentId,
    ticketVersionId,
    ticketId,
    content,
  };

  try {
    const { data } = await reactionService.create(payload);

    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const remove = async (req: Request, res: Response) => {
  if (!res.locals.user && !res.locals.anon_user_id) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const id = req.params.reactionId;

  try {
    await reactionService.remove(id);

    return res.status(200).json({});
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

export { getAll, create, remove };
