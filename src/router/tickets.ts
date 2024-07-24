import express from "express";

import * as ticketController from "../controllers/tickets.ts";

const TICKETS_ENDPOINT = "/projects/:projectId/tickets";
const TICKETS_ENDPOINT_ID = `${TICKETS_ENDPOINT}/:ticketId`;
const TICKET_VERSIONS_ENDPOINT = `${TICKETS_ENDPOINT_ID}/versions`;
const TICKET_VERSIONS_ENDPOINT_ID = `${TICKET_VERSIONS_ENDPOINT}/:versionId`;

const router = express.Router();

router.get("/projects/:projectId/tickets", ticketController.getAll);
router.get(
  "/projects/:projectId/tickets/:ticketId",
  ticketController.getSingle
);
router.post(TICKETS_ENDPOINT, ticketController.create);
router.put(TICKETS_ENDPOINT_ID, ticketController.update);
router.delete(TICKETS_ENDPOINT_ID, ticketController.del);

// track
router.post(`${TICKETS_ENDPOINT_ID}/track`, ticketController.uploadTrack);

// ticket versions
router.get(TICKET_VERSIONS_ENDPOINT, ticketController.getAllVersions);
router.get(TICKET_VERSIONS_ENDPOINT_ID, ticketController.getSingleVersion);
router.post(TICKET_VERSIONS_ENDPOINT, ticketController.createVersion);
router.delete(TICKET_VERSIONS_ENDPOINT_ID, ticketController.deleteVersion);

export { router };
