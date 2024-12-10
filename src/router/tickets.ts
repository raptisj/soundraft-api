import express from "express";

import * as ticketController from "../controllers/tickets";

const TICKETS_ENDPOINT = "/projects/:projectId/tickets";
const TICKETS_ENDPOINT_ID = `${TICKETS_ENDPOINT}/:ticketId`;
const TICKET_VERSIONS_ENDPOINT = `${TICKETS_ENDPOINT_ID}/versions`;
const TICKET_VERSIONS_ENDPOINT_ID = `${TICKET_VERSIONS_ENDPOINT}/:versionId`;

const router = express.Router();

// TODO: to be deprecated
router.get("/projects/:projectId/tickets", ticketController.getAll);
router.get(
  "/projects/:projectId/tickets/:ticketId",
  ticketController.getSingle
);
router.post("/projects/:projectId/tickets", ticketController.create);
router.put(TICKETS_ENDPOINT_ID, ticketController.update);
router.delete(TICKETS_ENDPOINT_ID, ticketController.del);

// router.get("/tickets", ticketController.getAll);
// router.get("/tickets/:ticketId", ticketController.getSingle);
// router.post("/tickets", ticketController.create);
// router.put("/tickets/:ticketId", ticketController.update);
// router.delete("/tickets/:ticketId", ticketController.del);

// track
router.post(`${TICKETS_ENDPOINT_ID}/track`, ticketController.uploadTrack);
// router.post("/tickets/:ticketId/track", ticketController.uploadTrack);

// ticket versions
router.get(TICKET_VERSIONS_ENDPOINT, ticketController.getAllVersions);
router.get(TICKET_VERSIONS_ENDPOINT_ID, ticketController.getSingleVersion);
router.post(TICKET_VERSIONS_ENDPOINT, ticketController.createVersion);
router.delete(TICKET_VERSIONS_ENDPOINT_ID, ticketController.deleteVersion);

// router.get("/tickets/:ticketId/versions", ticketController.getAllVersions);
// router.get(
//   "/tickets/:ticketId/versions/:versionId",
//   ticketController.getSingleVersion
// );
// router.post("/tickets/:ticketId/versions", ticketController.createVersion);
// router.delete(
//   "/tickets/:ticketId/versions/:versionId",
//   ticketController.deleteVersion
// );

// keep
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
export { router };
