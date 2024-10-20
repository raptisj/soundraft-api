import express from "express";

import * as reactionController from "../controllers/reactions";

const router = express.Router();

router.get("/reactions", reactionController.getAll);
router.post("/reactions", reactionController.create);
router.delete("/reactions/:reactionId", reactionController.remove);

export { router };
