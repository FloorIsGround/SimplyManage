import { Router } from "express";
import { postHold } from "../controllers/holdsController.js";

const router = Router();

router.post("/", postHold);

export default router;
