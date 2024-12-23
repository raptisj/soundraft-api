import express from "express";

import * as invitationController from "../controllers/invitations";

const router = express.Router();

router.post("/v1/invitations/create", invitationController.create);
router.get("/v1/invitations", invitationController.getList);
router.delete("/v1/invitations/:invitationId", invitationController.revoke);

// public
router.get(
  "/v1/public/invitations/:invitationToken",
  invitationController.getPublic
);
router.put(
  "/v1/public/invitations/:invitationId/accept",
  invitationController.accept
);

export { router };
