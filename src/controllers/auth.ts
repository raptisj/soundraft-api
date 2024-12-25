import type { Request, Response } from "express";
import {
  argon,
  generateSessionToken,
  createSession,
  invalidateSession,
} from "../libs/auth";
import { COOKIE_KEY, COOKIE_MAX_AGE, errors } from "../constants";
import {
  generateEntityId,
  isProd,
  isValidEmail,
  isValidPassword,
} from "../utils";
import * as authService from "../services/auth";
import * as userService from "../services/users";
import * as projectService from "../services/projects";
import * as ticketService from "../services/tickets";
import * as roleService from "../services/roles";
import * as trackService from "../services/tracks";
import * as commentService from "../services/comments";
import { logger } from "../utils/logger";
import Cookies from "cookies";

const createDefaultProjectAndTicket = async (userId: string) => {
  const { data: project } = await projectService.create({
    name: "First project",
    description: "This is an important project",
  });

  await roleService.createRole("admin", userId, project.id);

  const ticketId = generateEntityId("ti");
  const trackId = generateEntityId("tra");
  const versionId = generateEntityId("vrs");

  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() + 1);

  const payload = {
    ticketId,
    projectId: project.id,
    assignee: null,
    deadline: currentDate,
    status: "todo",
    title: "First draft",
    description: "This is my cool draft",
    createdBy: userId,
  };

  const trackUrl =
    "https://tqewfwkenyvqfshhzpyu.supabase.co/storage/v1/object/public/musaik/outfoxing.mp3";

  const trackPayload = {
    trackId,
    ticketId,
    projectId: project.id,
    trackUrl,
    versionId,
    trackName: "default_outfoxing.mp3",
    trackSize: BigInt(1831788), // around 1.8MB
    createdBy: userId,
  };

  await ticketService.create(payload);

  await ticketService.createVersion({ id: versionId, ticketId });

  await trackService.create(trackPayload);

  const commentId = generateEntityId("com");
  const regionId = generateEntityId("reg");

  const commentPayload = {
    commentId,
    ticketId,
    userId,
    trackId,
    ticketVersionId: versionId,
    content: "this is quite loud!",
    parentCommentId: null,
  };

  const regionPayload = {
    regionId,
    commentId,
    regionIndex: 2,
    startString: "0:10",
    endString: "0:19",
    startInt: 9.87477,
    endInt: 19.30192,
  };

  await commentService.create(commentPayload);

  await commentService.createRegion(regionPayload);
};

const signUp = async (req: Request, res: Response) => {
  try {
    const { data: existingUser } = await userService.getByEmail(req.body.email);
    if (existingUser) {
      return res.status(404).json({ errors: errors.USER_ALREADY_EXISTS });
    }

    const { data: user, error, token } = await authService.signUp(req.body);
    if (error) {
      return res.status(404).json({ errors: error });
    }

    await createDefaultProjectAndTicket(user.id);

    const cookies = new Cookies(req, res, {});
    cookies.set(COOKIE_KEY, token, {
      secure: isProd(),
      maxAge: 24 * 60 * 60 * 1000, // COOKIE_MAX_AGE // 30 days
    });
    return res.status(201).json({ status: "success", userId: user.id });
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
      return res.status(404).json({ errors: errors.USER_DOES_NOT_EXIST });
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
    cookies.set(COOKIE_KEY, token, {
      secure: isProd(),
      maxAge: 24 * 60 * 60 * 1000, // COOKIE_MAX_AGE // 30 days
    });

    res.appendHeader("Location", "/");

    return res.status(200).json({ status: "success", userId: existingUser.id });
  } catch (error) {
    console.log(error, "error log");
    logger.error({ error }, "error in sign in");
    return res.status(404).json({ errors: errors.GENERIC, status: "error" });
  }
};

const logout = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const cookies = new Cookies(req, res, {});
  cookies.set(COOKIE_KEY, "", { maxAge: 0 });
  await invalidateSession(res.locals.session.id);

  return res.status(200).end();
};

const currentUser = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const { data: currentUser } = await userService.getById(res.locals.user.id);

  const userData = { ...currentUser };

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

export {
  signUp,
  login,
  logout,
  currentUser,
  updateUserProfile,
  createDefaultProjectAndTicket,
};
