import { Argon2id } from "oslo/password";
import { Request, Response } from "express";
import { db, DatabaseUser } from "../config/db.ts";
import { v4 as uuidv4 } from "uuid";
import { generateId } from "lucia";
import { errors } from "../constants/index.ts";
import * as projectService from "../services/projects.ts";
import * as roleService from "../services/roles.ts";
import * as invitationService from "../services/invitations.ts";

const getAll = async (_: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }
  const userId = res.locals.user.id;

  try {
    const { data } = await projectService.getAll(userId);

    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const getSingle = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const id = req.params.id;

  try {
    const { data } = await projectService.getSingle(id);

    return res.status(200).json(data);
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

  const projectId = uuidv4();
  const roleId = uuidv4();

  const name: string = req.body?.name;
  const description: string = req.body?.description ?? "";
  if (!name) {
    return res.status(404).json({ errors: errors.REQUIRED_PROJECT_NAME });
  }

  try {
    // TODO: make this a transaction
    const { data } = await projectService.create(projectId, name, description);

    await roleService.createRole(roleId, "admin", userId, data.id);

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
  const id = req.params.id;

  const project = await db.query("SELECT * FROM projects WHERE id = $1", [id]);

  const projectData = project?.rows[0];

  const name: string = req.body?.name ?? projectData.name;
  const description: string =
    req.body?.description ?? projectData.description ?? "";

  try {
    const { data } = await projectService.update(id, name, description, userId);

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
  const id = req.params.id;
  // const client = await db.connect();

  try {
    const { data } = await projectService.deleteProject(id, userId);

    return res.status(200).json(data);
  } catch (e) {
    // await client.query("ROLLBACK");
    console.log(e, "e");
    return res.status(404).end();
  }
};

const inviteToProject = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const userId = res.locals.user.id;
  const inviteEmail = req.body?.invite_email;
  const inviteRole = req.body?.invite_role;
  const projectId = req.params.id;
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
    console.log(data, "data invitation");

    await invitationService.send(data);

    return res.status(200).json(data);
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const acceptInvitation = async (req: Request, res: Response) => {
  const hasAccount: string | null = req.body.has_account ?? false;
  const invitationId = req.body?.invitation_id;
  const roleId = uuidv4();
  const projectId = req.params.id;

  const result = await db.query("SELECT * FROM invitations WHERE id = $1", [
    invitationId,
  ]);

  const invitation = result?.rows[0];

  if (!hasAccount) {
    // TODO make login service
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email: string | null = req.body.email ?? null;

    if (!email || !emailRegex.test(email)) {
      console.log("Invalid email");
      return res.status(404).json({ errors: errors.INVALID_EMAIL });
    }

    const password: string | null = req.body.password ?? null;
    if (!password || password.length < 6 || password.length > 255) {
      console.log("Invalid password");
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

      await roleService.createRole(roleId, invitation.role, userId, projectId);

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

    await roleService.createRole(
      roleId,
      invitation.role,
      invitee.id,
      projectId
    );

    return res.status(200).json({});
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

const removeMember = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const userId = res.locals.user.id;
  const memberId = req.body?.member_id;
  const projectId = req.params.id;

  const userRole = await roleService.getRole(userId, projectId);

  if (!userRole.isAdmin()) {
    console.log("User is not admin");
    return res.status(404).json({ errors: errors.USER_NOT_ADMIN });
  }

  try {
    await roleService.removeFromProject(memberId, projectId);

    return res.status(201).json({});
  } catch (e) {
    console.log(e, "e");
    return res.status(400).json({ errors: errors.GENERIC });
  }
};

export {
  getAll,
  getSingle,
  create,
  update,
  del,
  inviteToProject,
  acceptInvitation,
  removeMember,
};
