import express from "express";

import * as commentController from "../controllers/comments";

const router = express.Router();

router.get("/v1/tickets/:ticketId/comments", commentController.getAll);
router.post("/v1/tickets/:ticketId/comments", commentController.create);
router.put(
  "/v1/tickets/:ticketId/comments/:commentId",
  commentController.update
);
router.delete(
  "/v1/tickets/:ticketId/comments/:commentId",
  commentController.del
);

export { router };
