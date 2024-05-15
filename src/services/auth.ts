import { generateId } from "lucia";
import { Argon2id } from "oslo/password";
import { isValidEmail, isValidPassword } from "../utils/index.ts";
import { db } from "../config/db.ts";
import { errors } from "../constants/index.ts";
import { lucia } from "../config/auth.ts";

export const signUp = async (
  payload: any
): Promise<{ error: any; session: any; data: any }> => {
  const {
    email,
    password,
    username = "",
    first_name = "",
    last_name = "",
  } = payload;

  if (!isValidEmail(email)) {
    return {
      error: errors.INVALID_EMAIL,
      session: null,
      data: null,
    };
  }

  if (!isValidPassword(password)) {
    return {
      error: errors.INVALID_PASSWORD,
      session: null,
      data: null,
    };
  }

  const hashedPassword = await new Argon2id().hash(password);
  const userId = generateId(15);

  const results = await db.query(
    "INSERT INTO users (id, email, password, username, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [userId, email, hashedPassword, username, first_name, last_name]
  );

  const session = await lucia.createSession(userId, {});

  // TODO: move this to saparate file
  const userMapper = (user: any) => {
    return {
      id: user.id,
      username: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    };
  };

  return {
    error: null,
    session,
    data: userMapper(results?.rows[0]),
  };
};
