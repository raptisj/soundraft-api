import { userDTO } from "../dto";
import { db, type DatabaseUser } from "../config/db";

export const getByEmail = async (email: string) => {
  const result = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  return {
    data: userDTO(result?.rows[0]) as DatabaseUser | undefined,
  };
};

export const getById = async (id: string) => {
  const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);

  return {
    data: userDTO(result?.rows[0]) as DatabaseUser | undefined,
  };
};

type UpdateProfileProps = {
  username: string;
  first_name: string;
  last_name: string;
};
export const updateProfile = async (
  payload: UpdateProfileProps,
  userData: UpdateProfileProps & { id: string }
) => {
  const {
    username = userData.username ?? "",
    first_name = userData.first_name ?? "",
    last_name = userData.last_name ?? "",
  } = payload;

  const result = await db.query(
    "UPDATE users SET username = $2, first_name = $3, last_name = $4 WHERE id = $1 RETURNING *",
    [userData.id, username, first_name, last_name]
  );

  return {
    data: userDTO(result?.rows[0]),
  };
};
