import { CustomError } from "../config/errors";
import { db } from "../config/db";
import { errors } from "../constants";

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

type CreateTicketProps = {
  ticketId: string;
  projectId: string;
  assignee?: string | null;
  deadline?: string | Date | null;
  status?: string | null;
  title: string;
  description: string;
  createdBy: string;
};
export const create = async (payload: CreateTicketProps) => {
  const {
    ticketId,
    projectId,
    assignee,
    deadline,
    status,
    title,
    description,
    createdBy,
  } = payload;

  const results = await db.query(
    "INSERT INTO tickets (id, project_id, title, description, ticket_status, assignee, deadline, created_by, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *;",
    [
      ticketId,
      projectId,
      title,
      description,
      status,
      assignee,
      deadline,
      createdBy,
    ]
  );

  return {
    data: results?.rows[0],
  };
};

type UpdateTicketProps = {
  assignee?: string | null;
  deadline?: string | Date | null;
  status?: string | null;
  title: string;
  description: string;
};
export const update = async (id: string, payload: UpdateTicketProps) => {
  const { title, description, status, assignee, deadline } = payload;

  const results = await db.query(
    "UPDATE tickets SET title = $2, description = $3, ticket_status = $4, assignee = $5, deadline = $6, updated_at = NOW() WHERE id = $1 RETURNING *;",
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

export const moveTicket = async (id: string, projectId: string) => {
  const results = await db.query(
    "UPDATE tickets SET project_id = $2, updated_at = NOW() WHERE id = $1 RETURNING *;",
    [id, projectId]
  );

  return {
    data: results?.rows[0],
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
