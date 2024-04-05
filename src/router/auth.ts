import express from "express";

import * as authController from "../controllers/auth.ts";

const router = express.Router();

router.post("/auth/signup", authController.signUp);
router.post("/auth/login", authController.login);
router.post("/auth/logout", authController.logout);
router.get("/user", authController.currentUser);
router.put("/user", authController.updateUserProfile);

export { router };
