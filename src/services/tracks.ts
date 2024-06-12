import { db } from "../config/db.ts";

export const create = async (payload: any): Promise<any> => {
  const { trackId, ticketId, projectId, trackUrl, versionId, trackName } =
    payload;

  const results = await db.query(
    "INSERT INTO tracks (id, ticket_id, project_id, ticket_version_id, track_url, track_nane, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *;",
    [trackId, ticketId, projectId, versionId, trackUrl, trackName]
  );

  return {
    data: results?.rows[0],
  };
};
