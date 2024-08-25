import { db } from "../config/db.ts";

export const getAll = async (ticketId: string, ticketVersionId: string) => {
  const results = await db.query(
    "SELECT * FROM reactions WHERE ticket_id = $1 AND ticket_version_id = $2;",
    [ticketId, ticketVersionId]
  );

  return {
    data: results?.rows ?? [],
  };
};

export const create = async (payload: any) => {
  const { reactionId, userId, commentId, ticketVersionId, ticketId, content } =
    payload;

  const results = await db.query(
    "INSERT INTO reactions (id, user_id, comment_id, content, ticket_id, ticket_version_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *",
    [reactionId, userId, commentId, content, ticketId, ticketVersionId]
  );

  return {
    data: results?.rows[0],
  };
};

export const remove = async (reactionId: string): Promise<any> => {
  await db.query("DELETE FROM reactions WHERE id = $1;", [reactionId]);

  return {};
};
