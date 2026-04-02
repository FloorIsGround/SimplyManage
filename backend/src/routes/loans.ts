import { Router } from "express";
import { postLoan } from "../controllers/loansController.js";

const router = Router();

router.post("/", postLoan);

export default router;
