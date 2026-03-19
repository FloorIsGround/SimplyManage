//import { pool } from "../config/db.js";
import { Router, type Request, type Response } from "express";
import {
  createUser,
  getFaqs,
  getBooks,
  searchBooks,
  getHoursLocations,
  getEvents,
  getUserByEmail,
} from "../config/db.js";
import reviewsRouter from "./reviews.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
    const user = await createUser({ email, password, firstName, lastName });
    res.status(201).json({ user });
  } catch (err: any) {
    // Handle duplicate email error
    if (err && typeof err === "object" && err.code === "23505") {
      return res.status(409).json({ error: "Email already exists." });
    }
    res.status(500).json({ error: err.message || "Signup failed." });
  }
});

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

router.get("/hourslocations", async (_req: Request, res: Response) => {
  const libraries = await getHoursLocations();
  res.json({ libraries });
});

// Reviews routes
router.use("/reviews", reviewsRouter);

// Login route
router.post("/users/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: "MISSING_FIELDS",
          message: "Email and password are required.",
        },
      });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Email or password is incorrect.",
        },
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Email or password is incorrect.",
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "changeme",
      { expiresIn: "1d" }
    );

    return res.json({ token });
  } catch (err: any) {
    res.status(500).json({
      error: {
        code: "LOGIN_ERROR",
        message: err.message || "Login failed.",
      },
    });
  }
});

export default router;