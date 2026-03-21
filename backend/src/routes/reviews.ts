import { Router } from "express";
import {
  getReviewsForBook,
  patchReview,
  postReview,
  removeReview,
} from "../controllers/reviewsController.js";

const router = Router();

router.get("/book/:bookId", getReviewsForBook);
router.post("/", postReview);
router.patch("/:id", patchReview);
router.delete("/:id", removeReview);

export default router;