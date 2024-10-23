import { Lucia, generateId as generateUserId } from "lucia";
import { Argon2id } from "oslo/password";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { NodePostgresAdapter } from "@lucia-auth/adapter-postgresql";
import { db, DatabaseUser } from "./db";

const adapter = new NodePostgresAdapter(db, {
  user: "users",
  session: "sessions",
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username || "",
      email: attributes.email,
      first_name: attributes.first_name || "",
      last_name: attributes.last_name || "",
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<DatabaseUser, "id">;
  }
}

const argon = new Argon2id();

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  token: string,
  userId: string
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await db.query(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)",
    [session.id, session.userId, session.expiresAt]
  );

  return session;
}

export async function validateSessionToken(
  token: string
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  // const row = await db.queryOne(
  //   "SELECT user_session.id, user_session.user_id, user_session.expires_at, app_user.id FROM user_session INNER JOIN user ON app_user.id = user_session.user_id WHERE id = ?",
  //   sessionId
  // );

  // const result = await db.query(
  //   "SELECT sessions.id, sessions.user_id, sessions.expires_at, users.id FROM sessions INNER JOIN users ON users.id = sessions.user_id WHERE sessions.id = $1",
  //   [sessionId]
  // );

  const result = await db.query(
    "SELECT sessions.id, sessions.user_id, sessions.expires_at, users.email FROM sessions INNER JOIN users ON users.id = sessions.user_id WHERE sessions.id = $1",
    [sessionId]
  );

  const row = result?.rows[0] || null;

  if (row === null) {
    return { session: null, user: null };
  }

  console.log(row, "row");
  const session: Session = {
    id: row.id,
    userId: row.user_id,
    expiresAt: new Date(row.expires_at * 1000),
  };
  console.log(session, "sesssion");
  const user: User = {
    id: row.user_id,
    email: row.email,
  };
  if (Date.now() >= session.expiresAt.getTime()) {
    // await db.execute("DELETE FROM user_session WHERE id = ?", session.id);
    await db.query("DELETE FROM sessions WHERE id = $1;", [session.id]);
    return null;
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    // await db.execute(
    //   "UPDATE user_session SET expires_at = ? WHERE id = ?",
    //   Math.floor(session.expiresAt / 1000),
    //   session.id
    // );

    await db.query("UPDATE sessions SET expires_at = $2 WHERE id = $1;", [
      session.id,
      Math.floor((session.expiresAt as any) / 1000),
    ]);
  }
  return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.query("DELETE FROM sessions WHERE id = $1;", [sessionId]);
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface User {
  id: string;
  email: string;
}

export { generateUserId, argon };
