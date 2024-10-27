export const errors = {
  GENERIC: {
    message: "Something went wrong!",
    error_code: "generic",
  },
  UNAUTHENTICATED: {
    message: "User is not authenticated",
    error_code: "unauthenticated",
  },
  REQUIRED_PROJECT_NAME: {
    message: "Name field is mandatory",
    error_code: "required_project_name",
  },
  INVALID_EMAIL: {
    message: "Invalid email",
    error_code: "invalid_email",
  },
  INVALID_PASSWORD: {
    message: "Invalid password",
    error_code: "invalid_password",
  },
  INCORRECT_PASSWORD: {
    message: "Incorrect password",
    error_code: "incorrect_password",
  },
  USER_EXISTS: {
    message: "User already exists",
    error_code: "user_exists",
  },
  USER_DOES_NOT_EXISTS: {
    message: "User does not exist",
    error_code: "user_does_not_exists",
  },
  USER_NOT_ADMIN: {
    message: "User is not admin. This action can not be made.",
    error_code: "user_not_admin",
  },
  UNABLE_TO_DELETE_LAST_VERSION: {
    message: "Can not delete the last remaining version",
    error_code: "can_not_delete_last_version",
  },
  TICKET_DOES_NOT_EXISTS: {
    message: "Ticket does not exist",
    error_code: "ticket_does_not_exists",
    status_code: 404,
  },
  RESOURCE_DOES_NOT_EXISTS: {
    message: "Resource does not exist",
    error_code: "resource_does_not_exists",
    status_code: 404,
  },
  INVITATION_ALREADY_SENT: {
    message: "Invitation already sent",
    error_code: "invitation_already_sent",
  },
};

export const COOKIE_KEY = "auth_session";
