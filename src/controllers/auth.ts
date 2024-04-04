import { Argon2id } from "oslo/password";
import { Request, Response } from "express";
import { generateId } from "lucia";
import { lucia } from "../config/auth.ts";
import { db, DatabaseUser } from "../config/db.ts";

const signUp = async (req: Request, res: Response) => {
  const username: string | null = req.body.username ?? null;
  if (
    !username ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    console.log("Invalid username");
    return res.status(404).send("Invalid username");
  }
  const password: string | null = req.body.password ?? null;
  if (!password || password.length < 6 || password.length > 255) {
    console.log("Invalid password");
    return res.status(404).send("Invalid password");
  }

  const hashedPassword = await new Argon2id().hash(password);
  const userId = generateId(15);

  try {
    await db.query(
      "INSERT INTO users (id, username, password) VALUES ($1, $2, $3)",
      [userId, username, hashedPassword]
    );

    const session = await lucia.createSession(userId, {});
    res.appendHeader(
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize()
    );

    return res.status(201).end();
  } catch (e) {
    console.log(e, "e");
    return res.status(400).send("Something went wrong!");
  }
};

const login = async (req: Request, res: Response) => {
  const username: string | null = req.body.username ?? null;
  if (
    !username ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    console.log("Invalid username");
    return res.status(404).send("Invalid username");
  }

  const password: string | null = req.body.password ?? null;
  if (!password || password.length < 6 || password.length > 255) {
    console.log("Invalid password");
    return res.status(404).send("Invalid password");
  }

  const userResult = await db.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);

  const existingUser = userResult?.rows[0] as DatabaseUser | undefined;

  if (!existingUser) {
    console.log("Incorrect username or password");
    return res.status(404).send("User exists");
  }

  const validPassword = await new Argon2id().verify(
    existingUser.password,
    password
  );
  if (!validPassword) {
    console.log("Incorrect username or password");
    return res.status(404).send("Incorrect username or password");
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
    return res.status(401).end();
  }

  console.log(res.locals.user.id, "user id");

  const userData = {
    ...res.locals.user,
  };

  return res.status(200).json(userData);
};
export { signUp, login, logout, currentUser };
