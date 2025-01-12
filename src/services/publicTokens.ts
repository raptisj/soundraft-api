import { db } from "../config/db";

export const getSingleByResourceId = async (id: string) => {
  const results = await db.query(
    "SELECT * FROM public_tokens WHERE resource_id = $1;",
    [id]
  );

  return {
    data: results?.rows[0],
  };
};

export const getSingleByToken = async (id: string) => {
  const results = await db.query(
    "SELECT * FROM public_tokens WHERE token = $1;",
    [id]
  );

  return {
    data: results?.rows[0],
  };
};

type CreateTokenProps = {
  id: string;
  resourceId: string;
  resourceType: string;
  token: string;
  metadata: { access_type: string; enabled: boolean };
  expiresAt: string;
  createdBy: string;
};
export const createToken = async (payload: CreateTokenProps) => {
  const {
    id,
    resourceId,
    resourceType,
    token,
    metadata,
    expiresAt,
    createdBy,
  } = payload;

  const results = await db.query(
    "INSERT INTO public_tokens (id, resource_id, resource_type, token, metadata, expires_at, created_by, created_at) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, NOW()) RETURNING *;",
    [id, resourceId, resourceType, token, metadata, expiresAt, createdBy]
  );

  return {
    data: results?.rows[0],
  };
};

type UpdateTokenMetadataProps = {
  id: string;
  metadata: { access_type: string; enabled: boolean };
};
export const updateTokenMetadata = async (
  payload: UpdateTokenMetadataProps
) => {
  const { id, metadata } = payload;

  const results = await db.query(
    "UPDATE public_tokens SET metadata = $2 WHERE id = $1 RETURNING *;",
    [id, metadata]
  );

  return {
    data: results?.rows[0],
  };
};

export const deleteToken = async (id: string) => {
  try {
    await db.query("DELETE FROM public_tokens WHERE id = $1;", [id]);
  } catch (error) {
    throw new Error();
  }

  return {
    data: {},
  };
};
