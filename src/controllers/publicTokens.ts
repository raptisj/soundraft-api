import type { Request, Response } from "express";
import { errors } from "../constants";
import * as publicTokenService from "../services/publicTokens";
import { generateEntityId, getGeneratedId } from "../utils";

const get = async (req: Request, res: Response) => {
  const ticketId = req.params.ticketId;

  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  try {
    const { data: publicLinkData } =
      await publicTokenService.getSingleByResourceId(ticketId);

    return res.status(200).json({ publicLinkData });
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const create = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const id = generateEntityId("pbt");
  const token = getGeneratedId();

  const resourceId = req.body?.resource_id;
  const resourceType = req.body?.resource_type;
  const metadata = req.body?.metadata;
  const expiresAt = req.body?.expires_at || null;

  const payload = {
    id,
    resourceId,
    resourceType,
    token,
    metadata,
    expiresAt,
    createdBy: res.locals.user.id,
  };

  try {
    const { data } = await publicTokenService.createToken(payload);

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

  const id = req.params.id;
  const metadata = req.body?.metadata;

  const payload = { id, metadata };

  try {
    const { data } = await publicTokenService.updateTokenMetadata(payload);

    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const remove = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const id = req.params.id;

  try {
    const { data } = await publicTokenService.deleteToken(id);

    return res.status(200).json({});
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

export { get, create, update, remove };
