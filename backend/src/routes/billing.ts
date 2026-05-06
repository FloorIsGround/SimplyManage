import { Router } from "express";
import { getOverdueFeeRate, getUserFees, patchOverdueFeeRate } from "../controllers/billingController.js";

const router = Router();

router.get("/users/:userId/fees", getUserFees);
router.get("/settings/overdue-fee-rate", getOverdueFeeRate);
router.patch("/settings/overdue-fee-rate", patchOverdueFeeRate);

export default router;
