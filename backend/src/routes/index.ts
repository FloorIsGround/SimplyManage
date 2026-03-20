//import { pool } from "../config/db.js";
import { Router, type Request, type Response } from "express";
import {
  getFaqs,
  getHoursLocations,
  getEvents,
} from "../config/db.js";
import { createStaffUser } from "../models/user/userQueries.js";
import reviewsRouter from "./reviews.js";
import booksRouter from "./books.js";
import copiesRouter from "./copies.js";
import usersRouter from "./users.js";

const router = Router();

router.get("/events", async (_req: Request, res: Response) => {
  const events = await getEvents();
  res.json(events);
});

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const user = await createStaffUser({ email, password, firstName, lastName });
    res.status(201).json({ user });
  } catch (err: any) {
    // Handle duplicate email error
    if (err && typeof err === "object" && err.code === "23505") {
      return res.status(409).json({ error: "Email already exists." });
    }
    res.status(500).json({ error: err.message || "Signup failed." });
  }
});

router.use("/books", booksRouter);

router.get("/", (_req: Request, res: Response) => {
  res.json({ ok: true, message: "SimplyManage API" });
});

router.get("/faqs", async (_req: Request, res: Response) => {
  const faqs = await getFaqs();
  res.json(faqs);
});

router.get("/hourslocations", async (_req: Request, res: Response) => {
  const libraries = await getHoursLocations();
  res.json({ libraries });
});

// Reviews routes
router.use("/reviews", reviewsRouter);

// Copies routes
router.use("/copies", copiesRouter);

// Users routes
router.use("/users", usersRouter);


export default router;