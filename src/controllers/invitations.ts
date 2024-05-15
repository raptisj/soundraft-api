import { Argon2id } from "oslo/password";
import { Request, Response, NextFunction } from "express";
import { db, DatabaseUser } from "../config/db.ts";
import { v4 as uuidv4 } from "uuid";
import { generateId } from "lucia";
import { CustomError } from "../config/errors.ts";
import { errors } from "../constants/index.ts";
import * as roleService from "../services/roles.ts";
import * as invitationService from "../services/invitations.ts";

const create = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const userId = res.locals.user.id;
  const inviteEmail = req.body?.invite_email;
  const inviteRole = req.body?.invite_role;
  const projectId = req.body?.project_id;

  const invitationId = uuidv4();

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
    // TODO make login service
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email: string | null = req.body.email ?? null;

    if (!email || !emailRegex.test(email)) {
      return res.status(404).json({ errors: errors.INVALID_EMAIL });
    }

    const password: string | null = req.body.password ?? null;
    if (!password || password.length < 6 || password.length > 255) {
      return res.status(404).json({ errors: errors.INVALID_PASSWORD });
    }

    const hashedPassword = await new Argon2id().hash(password);
    const userId = generateId(15);

    const userResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    const existingUser = userResult?.rows[0] as DatabaseUser | undefined;

    if (existingUser) {
      console.log("User already exists");
      return res.status(404).json({ errors: errors.USER_EXISTS });
    }

    try {
      await db.query(
        "INSERT INTO users (id, email, password) VALUES ($1, $2, $3)",
        [userId, email, hashedPassword]
      );

      // TODO: add auth service and remove the above
      // e.g. await authService.add(payload);
      await invitationService.accept(invitationId);

      await roleService.createRole(invitation.role, userId, projectId);

      return res.status(201).json({});
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
