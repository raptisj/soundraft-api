import express from "express";

import * as commentController from "../controllers/comments.ts";

const router = express.Router();

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

export { router };
