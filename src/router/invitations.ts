import express from "express";

import * as invitationController from "../controllers/invitations";

const router = express.Router();

// TODO: to be deprecated
// router.post("/invitations/create", invitationController.create);
// router.put(
//   "/public/invitations/:invitationId/accept",
//   invitationController.accept
// );
// router.get("/invitations", invitationController.getList);
// router.delete("/invitations/:invitationId", invitationController.revoke);

// // public
// router.get(
//   "/public/invitations/:invitationToken",
//   invitationController.getPublic
// );

// keep
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
