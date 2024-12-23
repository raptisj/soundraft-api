import express from "express";

import * as authController from "../controllers/auth";

const router = express.Router();

router.post("/v1/auth/signup", authController.signUp);
router.post("/v1/auth/login", authController.login);
router.post("/v1/auth/logout", authController.logout);
router.get("/v1/user", authController.currentUser);
router.put("/v1/user", authController.updateUserProfile);

export { router };
