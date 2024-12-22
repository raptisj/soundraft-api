import express from "express";

import * as rolesController from "../controllers/roles";

const router = express.Router();

// TODO: to be deprecated
// router.put("/roles/:id", rolesController.update);
// router.delete("/roles/:id", rolesController.remove);

// keep
router.put("/v1/roles/:id", rolesController.update);
router.delete("/v1/roles/:id", rolesController.remove);

export { router };
