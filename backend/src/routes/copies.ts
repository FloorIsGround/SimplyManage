import { Router } from "express";
import { getCopiesBook, getCopyBarcode, postCopies, patchCopyStatus } from "../controllers/copiesController.js";

const router = Router();

router.get("/book/:bookId", getCopiesBook);
router.get("/barcode/:barcode", getCopyBarcode);
router.post("/", postCopies);
router.patch("/barcode/:barcode/status", patchCopyStatus);

export default router;
