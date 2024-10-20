import express from "express";

import * as rolesController from "../controllers/roles";

const router = express.Router();

router.put("/roles/:id", rolesController.update);

export { router };
