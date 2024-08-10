import express from "express";

import * as commentController from "../controllers/comments.ts";

const router = express.Router();

const COMMENTS_ENDPOINT = "/projects/:projectId/tickets/:ticketId/comments";
const COMMENTS_ENDPOINT_ID = `${COMMENTS_ENDPOINT}/:commentId`;

router.get(COMMENTS_ENDPOINT, commentController.getAll);
// router.get('/tickets/:ticketId/comments, commentController.getAll);
router.post(COMMENTS_ENDPOINT, commentController.create);
router.put(COMMENTS_ENDPOINT_ID, commentController.update);
router.delete(COMMENTS_ENDPOINT_ID, commentController.del);

export { router };
