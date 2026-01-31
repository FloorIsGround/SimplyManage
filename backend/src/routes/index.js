import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ ok: true, message: "SimplyManage API" });
});

//Routers place holder

export default router;
