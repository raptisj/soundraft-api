import { db } from "../config/db";

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

type CreateTrackProps = {
  trackId: string;
  ticketId: string;
  trackUrl: string;
  versionId: string;
  trackName: string;
  trackSize: bigint;
  trackType: string;
  createdBy: string;
};
export const create = async (payload: CreateTrackProps) => {
  const {
    trackId,
    ticketId,
    trackUrl,
    versionId,
    trackName,
    trackSize,
    trackType,
    createdBy,
  } = payload;

  const results = await db.query(
    "INSERT INTO tracks (id, ticket_id, ticket_version_id, track_url, track_name, track_size, track_type, created_by, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *;",
    [
      trackId,
      ticketId,
      versionId,
      trackUrl,
      trackName,
      trackSize,
      trackType,
      createdBy,
    ]
  );

  return {
    data: results?.rows[0],
  };
};
