import { Router } from "express";
import { getCopyLoans, getLoan, getUserLoans, patchLoanReturn, postLoan } from "../controllers/loansController.js";

const router = Router();

router.post("/", postLoan);
router.get("/:loanId", getLoan);
router.get("/user/:userId", getUserLoans);
router.get("/copy/:copyId", getCopyLoans);
router.patch("/:loanId/return", patchLoanReturn);

export default router;
