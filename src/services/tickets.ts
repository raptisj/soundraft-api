import { CustomError } from "../config/errors.ts";
import { db } from "../config/db.ts";
import { errors } from "../constants/index.ts";

export const getAll = async (projectId: string) => {
  const results = await db.query(
    "SELECT * FROM tickets WHERE project_id = $1 ORDER BY created_at DESC;",
    [projectId]
  );

  return {
    data: results?.rows ?? [],
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

export const deleteTicket = async (id: string) => {
  try {
    await db.query("DELETE FROM tickets WHERE id = $1;", [id]);
  } catch (error) {
    throw new Error();
  }

  return {
    data: {},
  };
};

export const accessTicket = async (id: string) => {
  const result = await db.query(
    `SELECT access_type FROM tickets WHERE id = $1;`,
    [id]
  );

  let userResult = null;
  if (result?.rows[0]?.access_type !== "limited") {
    userResult = await db.query(`SELECT * FROM users WHERE id = $1;`, ["0"]);
  }

  return {
    data: result?.rows[0],
    user: userResult ? userResult.rows[0] : null,
  };
};

//////////
////////
////// ticket versions
////
//

export const getAllVersions = async (ticketId: string) => {
  const results = await db.query(
    "SELECT * FROM ticket_versions WHERE ticket_id = $1 ORDER BY created_at DESC;",
    [ticketId]
  );

  return {
    data: results?.rows ?? [],
  };
};

export const getVersion = async (id: string | undefined, ticketId: string) => {
  try {
    // query latests version if version_id is not provided
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

    if (!results?.rows[0]) {
      throw new Error();
    }

    return {
      data: results?.rows[0],
    };
  } catch (error) {
    throw new Error();
  }
};

type CreateVersionProps = {
  id: string;
  ticketId: string;
  name?: string;
  notes?: string;
};

export const createVersion = async (payload: CreateVersionProps) => {
  const { id, ticketId, name = "0.1", notes = "" } = payload;

  const results = await db.query(
    "INSERT INTO ticket_versions (id, ticket_id, name, notes, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *;",
    [id, ticketId, name, notes]
  );

  return {
    data: results?.rows[0],
  };
};

export const deleteTicketVersion = async (
  ticketId: string,
  versionId: string
) => {
  try {
    const results = await db.query(
      "SELECT * FROM ticket_versions WHERE ticket_id = $1;",
      [ticketId]
    );

    const versions = results?.rows;
    const canDelete = versions.length > 1;

    if (canDelete) {
      await db.query("DELETE FROM ticket_versions WHERE id = $1;", [versionId]);
    } else {
      throw new Error();
    }
  } catch (error) {
    throw new CustomError(errors.UNABLE_TO_DELETE_LAST_VERSION);
  }

  return {
    data: {},
  };
};
