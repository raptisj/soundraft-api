import express from "express";

import * as reactionController from "../controllers/reactions";

const router = express.Router();

router.get("/v1/reactions", reactionController.getAll);
router.post("/v1/reactions", reactionController.create);
router.delete("/v1/reactions/:reactionId", reactionController.remove);

export { router };
