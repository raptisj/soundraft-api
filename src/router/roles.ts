import express from "express";

import * as rolesController from "../controllers/roles";

const router = express.Router();

router.put("/v1/roles/:id", rolesController.update);
router.delete("/v1/roles/:id", rolesController.remove);

export { router };
