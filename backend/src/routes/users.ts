import { Router } from "express";
import { postUser } from "../controllers/usersController.js";

const router = Router();

router.post("/", postUser);

export default router;
