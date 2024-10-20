import { Lucia, generateId as generateUserId } from "lucia";
import { Argon2id } from "oslo/password";
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

export { generateUserId, argon };
