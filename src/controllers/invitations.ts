import type { Request, Response, NextFunction } from "express";
import { db, type DatabaseUser } from "../config/db";
import { CustomError } from "../config/errors";
import { COOKIE_KEY, errors } from "../constants";
import * as roleService from "../services/roles";
import * as invitationService from "../services/invitations";
import * as authService from "../services/auth";
import { generateEntityId, isProd } from "../utils";
import { logger } from "../utils/logger";
import Cookies from "cookies";

const create = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const userId = res.locals.user.id;
  const inviteEmail = req.body?.invite_email;
  const inviteRole = req.body?.invite_role;
  const projectId = req.body?.project_id;

  // const regex = /\+[^@]*@/; // remove all characters between the + and the @

  // // const email = "johndoe+yo@example.com";
  // const newEmail = inviteEmail.replace(regex, "@");

  const invitationExistsResult = await db.query(
    "SELECT * FROM invitations WHERE invited_email = $1 AND project_id = $2",
    [inviteEmail, projectId]
  );

  const invitationExists = invitationExistsResult?.rows[0];

  if (invitationExists && invitationExists.invitation_status === "pending") {
    logger.info({ invitationExists }, "invitation exists");
    return res.status(404).json({ errors: errors.INVITATION_ALREADY_SENT });
  }

  const invitationId = generateEntityId("inv");

  const inviteeUserResult = await db.query(
    "SELECT * FROM users WHERE email = $1",
    [inviteEmail]
  );

  const invitee = inviteeUserResult?.rows[0] as DatabaseUser | undefined;

  let hasAccount = false;
  if (invitee) {
    hasAccount = true;
  }

  const payload = {
    id: invitationId,
    invited_email: inviteEmail,
    role: inviteRole,
    has_account: hasAccount,
    role_type: "project",
    invited_by: userId,
    invitation_status: "pending",
    project_id: projectId,
  };

  logger.info({ payload }, "create invitation payload");
  try {
    const { data } = await invitationService.create(payload);
    logger.info({ data }, "send invitation data");

    await invitationService.send(data);

    return res.status(200).json(data);
  } catch (e) {
    logger.error({ error: e }, "error in invitation create");
    return res.status(404).end();
  }
};

const getPublic = async (req: Request, res: Response, next: NextFunction) => {
  const invitationToken = req.params.invitationToken;

  try {
    const { data } = await invitationService.get(invitationToken);

    if (!data) {
      const err = new CustomError(errors.RESOURCE_DOES_NOT_EXISTS);
      return next(err);
    }

    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const accept = async (req: Request, res: Response) => {
  const projectId = req.body?.project_id;
  const invitationId = req.params.invitationId;

  const result = await db.query("SELECT * FROM invitations WHERE id = $1", [
    invitationId,
  ]);

  const invitation = result?.rows[0];

  if (!invitation.has_account) {
    try {
      const { token, error, data: user } = await authService.signUp(req.body);
      if (error) {
        return res.status(404).json({ errors: error });
      }

      await invitationService.accept(invitationId);

      await roleService.createRole(invitation.role, user.id, projectId);

      const cookies = new Cookies(req, res, {});
      cookies.set(COOKIE_KEY, token, {
        secure: isProd(),
        maxAge: 60 * 60 * 1000, // COOKIE_MAX_AGE // 30 days
      });

      return res.status(201).json({ status: "success", userId: user.id });
    } catch (e) {
      console.log(e, "e");
      return res.status(400).json({ errors: errors.GENERIC });
    }
  }

  const inviteeUserResult = await db.query(
    "SELECT * FROM users WHERE email = $1",
    [invitation.invited_email]
  );

  const invitee = inviteeUserResult?.rows[0] as DatabaseUser | undefined;

  try {
    await invitationService.accept(invitationId);

    await roleService.createRole(invitation.role, invitee.id, projectId);

    return res.status(200).json({ status: "success" });
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const getList = async (req: Request, res: Response, next: NextFunction) => {
  const projectId = req.query.project_id as string;

  try {
    const { data } = await invitationService.getList(projectId);

    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const revoke = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const invitationId = req.params.invitationId;

  try {
    const { data } = await invitationService.revoke(invitationId);

    logger.info({ data }, "invitation revoked");
    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

export { create, accept, getPublic, getList, revoke };
