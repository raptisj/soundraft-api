import { db } from "../config/db";

export const getAll = async (
  ticketId: string,
  ticketVersionId: string,
  trackId: string
): Promise<any> => {
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

export const update = async (payload: any): Promise<any> => {
  const { commentId, ticketId, ticketVersionId, content } = payload;

  const results = await db.query(
    "UPDATE comments SET content = $4 WHERE id = $1 AND ticket_id = $2 AND ticket_version_id = $3 RETURNING *;",
    [commentId, ticketId, ticketVersionId, content]
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

export const updateRegion = async (payload: any): Promise<any> => {
  const { regionId, commentId, startString, endString, startInt, endInt } =
    payload;

  const results = await db.query(
    "UPDATE regions SET start_string = $3, end_string = $4, start_int = $5, end_int = $6 WHERE id = $1 AND comment_id = $2 RETURNING *;",
    [regionId, commentId, startString, endString, startInt, endInt]
  );

  return {
    data: results?.rows[0],
  };
};

export const deleteComment = async (commentId: string) => {
  try {
    await db.query("DELETE FROM comments WHERE id = $1;", [commentId]);

    await db.query("DELETE FROM comments WHERE parent_comment_id = $1;", [
      commentId,
    ]);
  } catch (error) {
    throw new Error();
  }

  return {
    data: {},
  };
};

export const deleteRegion = async (id: string) => {
  try {
    await db.query("DELETE FROM regions WHERE id = $1;", [id]);
  } catch (error) {
    throw new Error();
  }

  return {
    data: {},
  };
};

export const deleteManyComments = async (ticketId: string) => {
  try {
    await db.query("DELETE FROM comments WHERE ticket_id = $1;", [ticketId]);
  } catch (error) {
    throw new Error();
  }

  return {
    data: {},
  };
};
