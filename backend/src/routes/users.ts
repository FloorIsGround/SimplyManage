import { Router } from "express";
import { postUser, patchUser, patchUserStatus } from "../controllers/usersController.js";

const router = Router();

router.post("/", postUser);
router.patch("/:userId", patchUser);
router.patch("/:userId/status", patchUserStatus);

export default router;
