import express from "express";

import * as authController from "../controllers/auth";

const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

export { router as default };
