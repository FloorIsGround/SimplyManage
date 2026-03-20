import { Router } from "express";
import { getBookId, getBookIsbn, postBook } from "../controllers/booksController.js";

const router = Router();

router.get("/isbn/:isbn", getBookIsbn);
router.get("/:bookId", getBookId);
router.post("/", postBook);

export default router;
