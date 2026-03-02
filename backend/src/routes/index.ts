import { Router, type Request, type Response } from "express";

import { getFaqs, getBooks, searchBooks } from "../config/db.js";


const router = Router();

router.get("/books/search/:searchQuery", async (req: Request, res: Response) => {
  let { searchQuery } = req.params;
  if (Array.isArray(searchQuery)) searchQuery = searchQuery[0];
  const books = await searchBooks(searchQuery);
  res.json(books);
});

router.get("/books", async (_req: Request, res: Response) => {
  const books = await getBooks();
  res.json(books);
});

router.get("/", (_req: Request, res: Response) => {
  res.json({ ok: true, message: "SimplyManage API" });
});

router.get("/faqs", async (_req: Request, res: Response) => {
  const faqs = await getFaqs();
  res.json(faqs);
});

// Routers placeholder

export default router;
