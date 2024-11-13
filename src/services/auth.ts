import { generateEntityId, isValidEmail, isValidPassword } from "../utils";
import { db } from "../config/db";
import { errors } from "../constants";
import {
  argon,
  generateSessionToken,
  createSession,
  type Session,
} from "../libs/auth";
import { userDTO } from "../dto";

type SignUpProps = {
  email: string;
  password: string;
  username: string;
  first_name: string;
  last_name: string;
};
export const signUp = async (
  payload: SignUpProps
): Promise<{
  error: {
    message: string;
    error_code: string;
  };
  session: Session;
  token: string;
  data: Omit<SignUpProps, "password"> & { id: string };
}> => {
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
      token: null,
      data: null,
    };
  }

  if (!isValidPassword(password)) {
    return {
      error: errors.INVALID_PASSWORD,
      session: null,
      token: null,
      data: null,
    };
  }

  const hashedPassword = await argon.hash(password);
  const userId = generateEntityId("usr");

  const results = await db.query(
    "INSERT INTO users (id, email, password, username, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [userId, email, hashedPassword, username, first_name, last_name]
  );

  const token = generateSessionToken();
  const session = await createSession(token, userId);

  return {
    error: null,
    session,
    token: token || null,
    data: userDTO(results?.rows[0]),
  };
};
