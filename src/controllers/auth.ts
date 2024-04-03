import { Argon2id } from "oslo/password";
import { Request, Response } from "express";
import { generateId } from "lucia";
import { lucia } from "src/config/auth";
import { db, DatabaseUser } from "src/config/db";

const signUp = async (req: Request, res: Response) => {
  const username: string | null = req.body.username ?? null;
  if (
    !username ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    console.log("Invalid username");
  }
  const password: string | null = req.body.password ?? null;
  if (!password || password.length < 6 || password.length > 255) {
    console.log("Invalid password");
  }

  const hashedPassword = await new Argon2id().hash(password);
  const userId = generateId(15);

  try {
    await db.query(
      "INSERT INTO users (id, username, password) VALUES ($1, $2, $3) RETURNING *",
      [userId, username, hashedPassword]
    );

    const session = await lucia.createSession(userId, {});
    res
      .status(201)
      .appendHeader(
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize()
      );
  } catch (e) {
    console.log(e, "e");
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
  }

  const password: string | null = req.body.password ?? null;
  if (!password || password.length < 6 || password.length > 255) {
    console.log("Invalid username");
  }

  // const existingUser = db
  //   .prepare("SELECT * FROM user WHERE username = ?")
  //   .get(username) as DatabaseUser | undefined;

  const userResult = await db.query("SELECT * FROM users WHERE username = ?", [
    username,
  ]);

  const existingUser = userResult.rows[0] as DatabaseUser | undefined;

  if (!existingUser) {
    console.log("Incorrect username or password");
  }

  const validPassword = await new Argon2id().verify(
    existingUser.password,
    password
  );
  if (!validPassword) {
    console.log("Incorrect username or password");
  }

  const session = await lucia.createSession(existingUser.id, {});
  res
    .appendHeader(
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize()
    )
    .appendHeader("Location", "/");
};

const logout = async (_: Request, res: Response) => {
  if (!res.locals.session) {
    return res.status(401).end();
  }
  await lucia.invalidateSession(res.locals.session.id);
  return res.setHeader(
    "Set-Cookie",
    lucia.createBlankSessionCookie().serialize()
  );
};

export { signUp, login, logout };
