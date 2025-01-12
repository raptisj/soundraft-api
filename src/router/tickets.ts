import express from "express";

import * as ticketController from "../controllers/tickets";

const router = express.Router();

router.get("/v1/tickets", ticketController.getAll);
router.get("/v1/tickets/:ticketId", ticketController.getSingle);
router.post("/v1/tickets", ticketController.create);
router.put("/v1/tickets/:ticketId", ticketController.update);
router.delete("/v1/tickets/:ticketId", ticketController.del);

router.post("/v1/tickets/:ticketId/track", ticketController.uploadTrack);

router.get("/v1/tickets/:ticketId/versions", ticketController.getAllVersions);
router.get(
  "/v1/tickets/:ticketId/versions/:versionId",
  ticketController.getSingleVersion
);
router.post("/v1/tickets/:ticketId/versions", ticketController.createVersion);
router.delete(
  "/v1/tickets/:ticketId/versions/:versionId",
  ticketController.deleteVersion
);

// public
router.get("/v1/public/tickets/:token", ticketController.getPublicSingle);

export { router };
