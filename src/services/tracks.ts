// import { CustomError } from "../config/errors.ts";
import { db } from "../config/db.ts";
// import { errors } from "../constants/index.ts";

export const create = async (payload: any): Promise<any> => {
  const { trackId, ticketId, projectId, trackUrl, versionId } = payload;

  const results = await db.query(
    "INSERT INTO tracks (id, ticket_id, project_id, ticket_version_id, track_url, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *;",
    [trackId, ticketId, projectId, versionId, trackUrl]
  );

  return {
    data: results?.rows[0],
  };
};
