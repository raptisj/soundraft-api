import { v4 as uuidv4 } from "uuid";

/**
 * This function handles the generation of ids.
 * Currently uses UUID but it can be anything.
 */
export const getGeneratedId = () => {
  return uuidv4();
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
