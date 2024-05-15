import { db, DatabaseUser } from "../config/db.ts";

export const getByEmail = async (email: string) => {
  const result = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  return {
    data: result?.rows[0] as DatabaseUser | undefined,
  };
};

export const getById = async (id: string) => {
  const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);

  return {
    data: result?.rows[0] as DatabaseUser | undefined,
  };
};

export const updateProfile = async (payload: any, userData: any) => {
  const {
    username = userData.usename ?? "",
    first_name = userData.first_name ?? "",
    last_name = userData.last_name ?? "",
  } = payload;

  const result = await db.query(
    "UPDATE users SET username = $2, first_name = $3, last_name = $4 WHERE id = $1 RETURNING *",
    [userData.id, username, first_name, last_name]
  );

  return {
    data: result?.rows[0],
  };
};
