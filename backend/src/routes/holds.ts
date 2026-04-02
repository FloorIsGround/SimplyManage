import { Router } from "express";
import {
    getBookQueue,
    getHoldPosition,
    getUserHolds,
    patchHoldStatus,
    patchQueueOrder,
    postHold,
    removeHold,
} from "../controllers/holdsController.js";

const router = Router();

router.get("/book/:bookId", getBookQueue);
router.get("/book/:bookId/position/:userId", getHoldPosition); // later when auth middleware is implemented, we can simplify this to just /book/:bookId/position and get userId from the auth token
router.get("/user/:userId", getUserHolds);
router.post("/", postHold);
router.patch("/book/:bookId/reorder", patchQueueOrder);
router.patch("/:holdId/status", patchHoldStatus);
router.delete("/:holdId", removeHold);

export default router;
