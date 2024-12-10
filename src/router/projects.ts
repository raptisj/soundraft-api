import express from "express";

import * as projectController from "../controllers/projects";

const router = express.Router();

// TODO: to be deprecated
router.get("/projects", projectController.getAll);
router.get("/projects/:id", projectController.getSingle);
router.post("/projects", projectController.create);
router.put("/projects/:id", projectController.update);
router.delete("/projects/:id", projectController.del);
router.post("/projects/:id/members/remove", projectController.removeMember);

// keep
router.get("/v1/projects", projectController.getAll);
router.get("/v1/projects/:id", projectController.getSingle);
router.post("/v1/projects", projectController.create);
router.put("/v1/projects/:id", projectController.update);
router.delete("/v1/projects/:id", projectController.del);
router.post("/v1/projects/:id/members/remove", projectController.removeMember);

export { router };
