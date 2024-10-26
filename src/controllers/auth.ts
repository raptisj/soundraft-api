import type { Request, Response } from "express";
import {
  argon,
  generateSessionToken,
  createSession,
  invalidateSession,
} from "../config/auth";
import { COOKIE_KEY, errors } from "../constants";
import { isValidEmail, isValidPassword } from "../utils";
import * as authService from "../services/auth";
import * as userService from "../services/users";
import * as projectService from "../services/projects";
import { logger } from "../utils/logger";
import Cookies from "cookies";
// import * as ticketService from "../services/tickets.ts";

const signUp = async (req: Request, res: Response) => {
  try {
    const { error, token } = await authService.signUp(req.body);
    if (error) {
      return res.status(404).json({ errors: error });
    }

    const cookies = new Cookies(req, res, {});
    cookies.set(COOKIE_KEY, token);
    return res.status(201).json({ status: "success" });
  } catch (e) {
    logger.error({ error: e }, "error in sign up");
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

    const validPassword = await argon.verify(existingUser.password, password);

    if (!validPassword) {
      return res
        .status(404)
        .json({ errors: errors.INCORRECT_PASSWORD, status: "error" });
    }

    const token = generateSessionToken();
    await createSession(token, existingUser.id);

    const cookies = new Cookies(req, res, {});
    cookies.set(COOKIE_KEY, token);

    res.appendHeader("Location", "/");

    return res.status(200).json({ status: "success" });
  } catch (error) {
    logger.error({ error }, "error in sign in");
    return res.status(404).json({ errors: errors.GENERIC, status: "error" });
  }
};

const logout = async (req: Request, res: Response) => {
  if (!res.locals.session) {
    return res.status(401).end();
  }

  await invalidateSession(res.locals.session.id);

  const cookies = new Cookies(req, res, {});
  cookies.set(COOKIE_KEY, null);

  return res.status(200).end();
};

const currentUser = async (req: Request, res: Response) => {
  const projectId = req.query.project_id as string;
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
