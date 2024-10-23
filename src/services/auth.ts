// import { generateId } from "lucia";
// import { Argon2id } from "oslo/password";
import { isValidEmail, isValidPassword } from "../utils";
import { db } from "../config/db";
import { errors } from "../constants";
import { argon, lucia, generateUserId } from "../config/auth";
import { userDTO } from "../dto";

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

  // const hashedPassword = await new Argon2id().hash(password);
  const hashedPassword = await argon.hash(password);
  const userId = generateUserId(15);

  const results = await db.query(
    "INSERT INTO users (id, email, password, username, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [userId, email, hashedPassword, username, first_name, last_name]
  );

  // const token = cookies.get("session");

  //   const token = await generateSessionToken();
  // const session = await createSession(token, userId);
  const session = await lucia.createSession(userId, {});

  return {
    error: null,
    session,
    data: userDTO(results?.rows[0]),
  };
};
