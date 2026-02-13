import { Router, type Request, type Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({ ok: true, message: "SimplyManage API" });
});

// Routers placeholder

export default router;
