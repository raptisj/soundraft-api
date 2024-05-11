import { db } from "../config/db.ts";

export const getAll = async (projectId: string) => {
  const results = await db.query(
    "SELECT * FROM tickets WHERE project_id = $1;",
    [projectId]
  );

  return {
    data: results?.rows[0] ?? [],
  };
};

export const getSingle = async (id: string) => {
  const results = await db.query("SELECT * FROM tickets WHERE id = $1;", [id]);

  return {
    data: results?.rows[0],
  };
};

export const create = async (payload: any): Promise<any> => {
  const {
    ticketId,
    projectId,
    assignee,
    deadline,
    status,
    title,
    description,
  } = payload;

  const results = await db.query(
    "INSERT INTO tickets (id, project_id, title, description, ticket_status, assignee, deadline, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *;",
    [ticketId, projectId, title, description, status, assignee, deadline]
  );

  return {
    data: results?.rows[0],
  };
};

export const update = async (id: string, payload: any): Promise<any> => {
  const { title, description, status, assignee, deadline } = payload;

  const results = await db.query(
    "UPDATE tickets SET title = $2, description = $3, ticket_status = $4, assignee = $5, deadline = $6 WHERE id = $1 RETURNING *;",
    [id, title, description, status, assignee, deadline]
  );

  return {
    data: results?.rows[0],
  };
};

export const getVersion = async (id: string | undefined, ticketId: string) => {
  if (!id) {
    const results = await db.query(
      "SELECT * FROM ticket_versions WHERE ticket_id = $1 ORDER BY created_at DESC LIMIT 1;",
      [ticketId]
    );

    return {
      data: results?.rows[0],
    };
  }

  const results = await db.query(
    "SELECT * FROM ticket_versions WHERE id = $1 AND ticket_id = $2;",
    [id, ticketId]
  );

  return {
    data: results?.rows[0],
  };
};

export const deleteTicket = async (id: string) => {
  try {
    await db.query(`DELETE FROM tickets WHERE id = $1;`, [id]);
  } catch (error) {
    throw new Error();
  }

  return {
    data: {},
  };
};

type CreateVersionProps = {
  id: string;
  ticketId: string;
  name?: string;
};
export const createVersion = async (payload: CreateVersionProps) => {
  const { id, ticketId, name = "0" } = payload;

  const results = await db.query(
    "INSERT INTO ticket_versions (id, ticket_id, name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *;",
    [id, ticketId, name]
  );

  return {
    data: results?.rows[0],
  };
};

export const getAllVersions = async (ticketId: string) => {
  const results = await db.query(
    "SELECT * FROM ticket_versions WHERE ticket_id = $1;",
    [ticketId]
  );

  return {
    data: results?.rows[0],
  };
};
