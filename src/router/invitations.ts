import express from "express";

import * as invitationController from "../controllers/invitations.ts";

const router = express.Router();

router.post("/invitations/create", invitationController.create);
router.put(
  "/public/invitations/:invitationId/accept",
  invitationController.accept
);

// public
router.get(
  "/public/invitations/:invitationToken",
  invitationController.getPublic
);

export { router };
