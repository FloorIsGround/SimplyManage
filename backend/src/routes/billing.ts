import { Router } from "express";
import { createUserReceipt, getOverdueFeeRate, getUserFees, patchOverdueFeeRate } from "../controllers/billingController.js";

const router = Router();

router.get("/users/:userId/fees", getUserFees);
router.post("/users/:userId/receipts", createUserReceipt);
router.get("/settings/overdue-fee-rate", getOverdueFeeRate);
router.patch("/settings/overdue-fee-rate", patchOverdueFeeRate);

export default router;
