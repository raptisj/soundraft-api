import { v4 as uuidv4 } from "uuid";

export const getGeneratedId = () => {
  return uuidv4();
};

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
