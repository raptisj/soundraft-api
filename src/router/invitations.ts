import express from "express";

import * as invitationController from "../controllers/invitations";

const router = express.Router();

router.post("/invitations/create", invitationController.create);
router.put(
  "/public/invitations/:invitationId/accept",
  invitationController.accept
);
router.get("/invitations", invitationController.getList);
router.delete("/invitations/:invitationId", invitationController.revoke);

// public
router.get(
  "/public/invitations/:invitationToken",
  invitationController.getPublic
);

export { router };
