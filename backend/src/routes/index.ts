import { Router, type Request, type Response } from "express";
import { getFaqs } from "../config/db.js";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({ ok: true, message: "SimplyManage API" });
});

router.get("/faqs", async (_req: Request, res: Response) => {
  const faqs = await getFaqs();
  res.json(faqs);
});

// Routers placeholder

export default router;
