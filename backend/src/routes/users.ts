import { Router } from "express";
import { postUser, patchUser, patchUserStatus, patchUserPassword, postVerifyPassword, removeUser } from "../controllers/usersController.js";

const router = Router();

router.post("/", postUser);
router.patch("/:userId", patchUser);
router.patch("/:userId/status", patchUserStatus);
router.patch("/:userId/password", patchUserPassword);
router.post("/:userId/verify-password", postVerifyPassword);
router.delete("/:userId", removeUser);

export default router;
