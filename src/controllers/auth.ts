import { Argon2id } from "oslo/password";
import { Request, Response } from "express";
import { generateId } from "lucia";
import { lucia } from "../config/auth.ts";
import { db, DatabaseUser } from "../config/db.ts";
import { errors } from "../constants/index.ts";

const signUp = async (req: Request, res: Response) => {
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

  try {
    await db.query(
      "INSERT INTO users (id, email, password) VALUES ($1, $2, $3)",
      [userId, email, hashedPassword]
    );

    const session = await lucia.createSession(userId, {});
    res.appendHeader(
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize()
    );

    return res.status(201).end();
  } catch (e) {
    console.log(e, "e");
    return res.status(400).json({ errors: errors.GENERIC });
  }
};

const login = async (req: Request, res: Response) => {
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

  const userResult = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  const existingUser = userResult?.rows[0] as DatabaseUser | undefined;

  if (!existingUser) {
    console.log("User already exists");
    return res.status(404).json({ errors: errors.USER_EXISTS });
  }

  const validPassword = await new Argon2id().verify(
    existingUser.password,
    password
  );
  if (!validPassword) {
    return res.status(404).json({ errors: errors.INCORRECT_PASSWORD });
  }

  const session = await lucia.createSession(existingUser.id, {});
  res
    .appendHeader(
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize()
    )
    .appendHeader("Location", "/");

  return res.status(200).end();
};

const logout = async (_: Request, res: Response) => {
  if (!res.locals.session) {
    return res.status(401).end();
  }
  await lucia.invalidateSession(res.locals.session.id);
  res.setHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize());
  return res.status(200).end();
};

const currentUser = async (_: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }

  const userData = {
    ...res.locals.user,
  };

  return res.status(200).json(userData);
};

const updateUserProfile = async (req: Request, res: Response) => {
  if (!res.locals.user) {
    return res.status(401).json({ errors: errors.UNAUTHENTICATED });
  }
  const userId = res.locals.user.id;

  const userResult = await db.query("SELECT * FROM users WHERE id = $1", [
    userId,
  ]);

  const user = userResult?.rows[0] as DatabaseUser | undefined;

  const username: string = req.body?.username ?? user.username ?? "";
  const firstName: string = req.body?.first_name ?? user.first_name ?? "";
  const lastName: string = req.body?.last_name ?? user.last_name ?? "";

  try {
    const results = await db.query(
      "UPDATE users SET username = $2, first_name = $3, last_name = $4 WHERE id = $1 RETURNING *",
      [userId, username, firstName, lastName]
    );

    const updatedUser = results.rows[0];

    return res.status(200).json({ updatedUser });
  } catch (e) {
    console.log(e, "e");
    return res.status(404).end();
  }
};

export { signUp, login, logout, currentUser, updateUserProfile };
