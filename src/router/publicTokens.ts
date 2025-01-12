import express from "express";

import * as publicTokensController from "../controllers/publicTokens";

const router = express.Router();

router.get("/v1/public_tokens/:ticketId", publicTokensController.get);
router.put("/v1/public_tokens/:id", publicTokensController.update);
router.post("/v1/public_tokens", publicTokensController.create);
router.delete("/v1/public_tokens/:id", publicTokensController.remove);

export { router };
