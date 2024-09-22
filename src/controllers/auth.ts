import { Argon2id } from "oslo/password";
import { Request, Response } from "express";
import { lucia } from "../config/auth.ts";
import { errors } from "../constants/index.ts";
import { isValidEmail, isValidPassword } from "../utils/index.ts";
import * as authService from "../services/auth.ts";
import * as userService from "../services/users.ts";
import * as projectService from "../services/projects.ts";
// import * as ticketService from "../services/tickets.ts";

const signUp = async (req: Request, res: Response) => {
  try {
    const { session, error } = await authService.signUp(req.body);
    if (error) {
      return res.status(404).json({ errors: error });
    }

    res.appendHeader(
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize()
    );

    return res.status(201).json({ status: "success" });
  } catch (e) {
    console.log(e, "e");
    return res.status(400).json({ errors: errors.GENERIC });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const email: string | null = req.body.email ?? null;
    if (!isValidEmail(email)) {
      return res
        .status(404)
        .json({ errors: errors.INVALID_EMAIL, status: "error" });
    }

    const password: string | null = req.body.password ?? null;
    if (!isValidPassword(password)) {
      return res.status(404).json({ errors: errors.INVALID_PASSWORD });
    }

    const { data: existingUser } = await userService.getByEmail(req.body.email);
    if (!existingUser) {
      return res.status(404).json({ errors: errors.USER_DOES_NOT_EXISTS });
    }

    const validPassword = await new Argon2id().verify(
      existingUser.password,
      password
    );
    if (!validPassword) {
      return res
        .status(404)
        .json({ errors: errors.INCORRECT_PASSWORD, status: "error" });
    }

    const session = await lucia.createSession(existingUser.id, {});
    res
      .appendHeader(
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize()
      )
      .appendHeader("Location", "/");

    return res.status(200).json({ status: "success" });
  } catch (error) {
    return res.status(404).json({ errors: errors.GENERIC, status: "error" });
  }
};

const logout = async (_: Request, res: Response) => {
  if (!res.locals.session) {
    return res.status(401).end();
  }

  await lucia.invalidateSession(res.locals.session.id);
  res.setHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize());
  return res.status(200).end();
};

const currentUser = async (req: Request, res: Response) => {
  const projectId: any = req.query.project_id;
  // const ticketId: any = req.query.ticket_id;

  // const { data: access, user } = await ticketService.accessTicket(ticketId);
  const { data: access, user } = await projectService.accessProject(projectId);

  if (
    (access?.access_type === "public_edit" ||
      access?.access_type === "public_read_only") &&
    !res.locals.user
  ) {
    return res.status(200).json({ ...user, access_type: access?.access_type });
  }

  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const userData = {
    ...res.locals.user,
    access_type: access?.access_type,
  };

  return res.status(200).json(userData);
};

const updateUserProfile = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }
  const userId = res.locals.user.id;

  const { data: currentUser } = await userService.getById(userId);

  try {
    const { data: updatedUser } = await userService.updateProfile(
      req.body,
      currentUser
    );

    return res.status(200).json({ updatedUser });
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

export { signUp, login, logout, currentUser, updateUserProfile };
