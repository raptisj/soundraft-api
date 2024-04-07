import express from "express";

import * as projectController from "../controllers/projects.ts";

const router = express.Router();

router.get("/projects", projectController.getAll);
router.get("/projects/:id", projectController.getSingle);
router.post("/projects", projectController.create);
router.put("/projects/:id", projectController.update);
router.delete("/projects/:id", projectController.del);
router.post("/projects/:id/invite/create", projectController.inviteToProject);
router.post("/projects/:id/invite/accept", projectController.acceptInvitation);
// router.post("/projects/:id/invite/revoke", projectController.revokeInvitation);
router.post("/projects/:id/members/remove", projectController.removeMember);

export { router };
