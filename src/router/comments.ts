import express from "express";

import * as commentController from "../controllers/comments";

const router = express.Router();

// TODO: to be deprecated
router.get(
  "/projects/:projectId/tickets/:ticketId/comments",
  commentController.getAll
);
router.post(
  "/projects/:projectId/tickets/:ticketId/comments",
  commentController.create
);
router.put(
  "/projects/:projectId/tickets/:ticketId/comments/:commentId",
  commentController.update
);
router.delete(
  "/projects/:projectId/tickets/:ticketId/comments/:commentId",
  commentController.del
);

// keep
router.get(
  "/v1/projects/:projectId/tickets/:ticketId/comments",
  commentController.getAll
);
router.post(
  "/v1/projects/:projectId/tickets/:ticketId/comments",
  commentController.create
);
router.put(
  "/v1/projects/:projectId/tickets/:ticketId/comments/:commentId",
  commentController.update
);
router.delete(
  "/v1/projects/:projectId/tickets/:ticketId/comments/:commentId",
  commentController.del
);

export { router };
