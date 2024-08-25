import { v4 as uuidv4 } from "uuid";

/**
 * This function handles the generation of ids.
 * Currently uses UUID but it can be anything.
 */
export const getGeneratedId = () => {
  return uuidv4();
};

/**
 * Generates random id and prepends the entity.
 * e.g. project_fsdf98sf09sdf809ds, ticket_fdjfs9df8s9f89s9f8
 */

type GenerateEntityIdType =
  | "prj" // project
  | "ti" // ticket
  | "vrs" // ticket version
  | "tra" // track
  | "com" // comment
  | "reg" // region
  | "inv" // invitation
  | "rct" // reaction
  | "rol";

export const generateEntityId = (str: GenerateEntityIdType) => {
  const id = uuidv4();
  return `${str}_${id.replace(/-/g, "")}`;
};

/**
 Validates form fields
 */
export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return false;
  }

  return emailRegex.test(email);
};

export const isValidPassword = (password: string) => {
  return password && password.length > 6 && password.length < 255;
};
