import { db } from "../config/db.ts";

export const getAll = async (
  ticketId: string,
  ticketVersionId: string,
  trackId: string
): Promise<any> => {
  // const results = await db.query(
  //   "SELECT * FROM comments WHERE ticket_id = $1 AND ticket_version_id = $2 AND track_id = $3 ORDER BY created_at DESC;",
  //   [ticketId, ticketVersionId, trackId]
  // );

  const results = await db.query(
    `SELECT c.*, json_build_object(
      'id', r.id,
      'comment_id', r.comment_id,
      'start_string', r.start_string,
      'end_string', r.end_string,
      'region_index', r.region_index,
      'start_int', r.start_int,
      'end_int', r.end_int,
      'created_at', r.created_at
      ) AS region
      FROM comments c
      LEFT JOIN regions r ON c.id = r.comment_id
      WHERE c.ticket_id = $1
      AND c.ticket_version_id = $2
      AND c.track_id = $3
      ORDER BY c.created_at DESC;`,
    [ticketId, ticketVersionId, trackId]
  );

  return {
    data: results?.rows ?? [],
  };
};

export const create = async (payload: any): Promise<any> => {
  const {
    commentId,
    ticketId,
    userId,
    trackId,
    ticketVersionId,
    content,
    parentCommentId,
  } = payload;

  const results = await db.query(
    "INSERT INTO comments (id, ticket_id, track_id, ticket_version_id, user_id, content, parent_comment_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *;",
    [
      commentId,
      ticketId,
      trackId,
      ticketVersionId,
      userId,
      content,
      parentCommentId,
    ]
  );

  return {
    data: results?.rows[0],
  };
};

export const createRegion = async (payload: any): Promise<any> => {
  const {
    regionId,
    commentId,
    regionIndex,
    startString,
    endString,
    startInt,
    endInt,
  } = payload;

  const results = await db.query(
    "INSERT INTO regions (id, comment_id, region_index, start_string, end_string, start_int, end_int, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *;",
    [regionId, commentId, regionIndex, startString, endString, startInt, endInt]
  );

  return {
    data: results?.rows[0],
  };
};
