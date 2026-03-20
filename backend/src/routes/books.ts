import { Router } from "express";
import { getBookId, getBookIsbn, postBook, patchBook, removeBook } from "../controllers/booksController.js";

const router = Router();

router.get("/isbn/:isbn", getBookIsbn);
router.get("/:bookId", getBookId);
router.post("/", postBook);
router.patch("/:bookId", patchBook);
router.delete("/:bookId", removeBook);

export default router;
