import express from "express";

import * as commentController from "../controllers/comments.ts";

const router = express.Router();

router.get(
  "/projects/:projectId/tickets/:ticketId/comments",
  commentController.getAll
);
// router.get("/projects/:id", commentController.getSingle);
router.post(
  "/projects/:projectId/tickets/:ticketId/comments",
  commentController.create
);
// router.put("/projects/:id", commentController.update);
// router.delete("/projects/:id", commentController.del);
// router.post("/projects/:id/members/remove", commentController.removeMember);

export { router };
