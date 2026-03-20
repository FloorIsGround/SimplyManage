import { Router } from "express";
import { getBookId, getBookIsbn } from "../controllers/booksController.js";

const router = Router();

router.get("/isbn/:isbn", getBookIsbn);
router.get("/:bookId", getBookId);

export default router;
