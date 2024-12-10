import express from "express";

import * as reactionController from "../controllers/reactions";

const router = express.Router();

// TODO: to be deprecated
router.get("/reactions", reactionController.getAll);
router.post("/reactions", reactionController.create);
router.delete("/reactions/:reactionId", reactionController.remove);

// keep
router.get("/v1/reactions", reactionController.getAll);
router.post("/v1/reactions", reactionController.create);
router.delete("/v1/reactions/:reactionId", reactionController.remove);

export { router };
