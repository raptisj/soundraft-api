import express from "express";

import * as ticketController from "../controllers/tickets.ts";

const router = express.Router();

router.get("/projects/:projectId/tickets", ticketController.getAll);
router.get(
  "/projects/:projectId/tickets/:ticketId",
  ticketController.getSingle
);
router.post("/projects/:projectId/tickets", ticketController.create);
router.put("/projects/:projectId/tickets/:ticketId", ticketController.update);
router.delete("/projects/:projectId/tickets/:ticketId", ticketController.del);

// ticket versions
router.get(
  "/projects/:projectId/tickets/:ticketId/versions",
  ticketController.getAllVersions
);
router.get(
  "/projects/:projectId/tickets/:ticketId/versions/:versionId",
  ticketController.getSingleVersion
);
router.post(
  "/projects/:projectId/tickets/:ticketId/versions",
  ticketController.createVersion
);
router.delete(
  "/projects/:projectId/tickets/:ticketId/versions/:versionId",
  ticketController.deleteVersion
);

export { router };
