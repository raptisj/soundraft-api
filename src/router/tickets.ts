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

// versions
router.get(
  "/projects/:projectId/tickets/:ticketId/versions",
  ticketController.getAllVersions
);
// router.get(
//   "/projects/:id/tickets/:ticketId/versions/:versionId",
//   ticketController.getAllSingleVersion
// );
// router.post(
//   "/projects/:id/tickets/:ticketId/versions",
//   ticketController.createVersion
// );

export { router };
