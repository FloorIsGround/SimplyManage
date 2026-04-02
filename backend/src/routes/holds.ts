import { Router } from "express";
import {
    getBookQueue,
    getHoldPosition,
    getUserHolds,
    postHold,
} from "../controllers/holdsController.js";

const router = Router();

router.get("/book/:bookId", getBookQueue);
router.get("/book/:bookId/position/:userId", getHoldPosition); // later when auth middleware is implemented, we can simplify this to just /book/:bookId/position and get userId from the auth token
router.get("/user/:userId", getUserHolds);
router.post("/", postHold);

export default router;
