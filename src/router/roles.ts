import express from "express";

import * as rolesController from "../controllers/roles";

const router = express.Router();

router.put("/roles/:id", rolesController.update);
router.delete("/roles/:id", rolesController.remove);

export { router };
