import { Request, Response, NextFunction } from "express";
import { db, DatabaseUser } from "../config/db.ts";
import { CustomError } from "../config/errors.ts";
import { errors } from "../constants/index.ts";
import * as roleService from "../services/roles.ts";
import * as invitationService from "../services/invitations.ts";
import * as authService from "../services/auth.ts";
import { lucia } from "../config/auth.ts";
import { getGeneratedId } from "../utils/index.ts";

const create = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const userId = res.locals.user.id;
  const inviteEmail = req.body?.invite_email;
  const inviteRole = req.body?.invite_role;
  const projectId = req.body?.project_id;

  const invitationId = getGeneratedId();

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

  try {
    const { data } = await invitationService.create(payload);

    await invitationService.send(data);

    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
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
      const { session, error, data: user } = await authService.signUp(req.body);
      if (error) {
        return res.status(404).json({ errors: error });
      }

      await invitationService.accept(invitationId);

      await roleService.createRole(invitation.role, user.id, projectId);

      res.appendHeader(
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize()
      );

      return res.status(201).json({ status: "success" });
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

    return res.status(200).json({});
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

export { create, accept, getPublic };
