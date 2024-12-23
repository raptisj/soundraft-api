import express from "express";

import * as projectController from "../controllers/projects";

const router = express.Router();

router.get("/v1/projects", projectController.getAll);
router.get("/v1/projects/:id", projectController.getSingle);
router.post("/v1/projects", projectController.create);
router.put("/v1/projects/:id", projectController.update);
router.delete("/v1/projects/:id", projectController.del);

export { router };
