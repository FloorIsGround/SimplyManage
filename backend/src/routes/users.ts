import { Router } from "express";
import { getUser, postLogin, postUser, patchUser, patchUserStatus, patchUserPassword, postVerifyPassword, removeUser } from "../controllers/usersController.js";

const router = Router();

router.post("/login", postLogin);
router.get("/:userId", getUser);
router.post("/", postUser);
router.patch("/:userId", patchUser);
router.patch("/:userId/status", patchUserStatus);
router.patch("/:userId/password", patchUserPassword);
router.post("/:userId/verify-password", postVerifyPassword);
router.delete("/:userId", removeUser);

export default router;
