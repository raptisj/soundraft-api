import express from "express";

import * as rolesController from "../controllers/roles.ts";

const router = express.Router();

router.put("/roles/:id", rolesController.update);

export { router };
