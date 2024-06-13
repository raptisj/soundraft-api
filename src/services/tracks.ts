import { db } from "../config/db.ts";

export const getSingle = async (ticket_id: string, version_id: string) => {
  const results = await db.query(
    "SELECT * FROM tracks WHERE ticket_id = $1 AND ticket_version_id = $2;",
    [ticket_id, version_id]
  );

  return {
    data: results?.rows[0] || null,
  };
};

export const getAll = async (ticket_id: string) => {
  const results = await db.query("SELECT * FROM tracks WHERE ticket_id = $1;", [
    ticket_id,
  ]);

  return {
    data: results?.rows || [],
  };
};

export const create = async (payload: any): Promise<any> => {
  const { trackId, ticketId, projectId, trackUrl, versionId, trackName } =
    payload;

  const results = await db.query(
    "INSERT INTO tracks (id, ticket_id, project_id, ticket_version_id, track_url, track_name, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *;",
    [trackId, ticketId, projectId, versionId, trackUrl, trackName]
  );

  return {
    data: results?.rows[0],
  };
};
