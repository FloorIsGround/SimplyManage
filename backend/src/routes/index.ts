import { Router, type Request, type Response } from "express";
import {
  createUser,
  getFaqs,
  getBooks,
  searchBooks,
  getHoursLocations,
  getEvents,
  getUserByEmail,
  createReview
} from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

// --- EVENTS ---
router.get("/events", async (_req: Request, res: Response) => {
  const events = await getEvents();
  res.json(events);
});

// --- SIGNUP ---
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const user = await createUser({ email, password, firstName, lastName });
    res.status(201).json({ user });
  } catch (err: any) {
    if (err && typeof err === "object" && err.code === "23505") {
      return res.status(409).json({ error: "Email already exists." });
    }
    res.status(500).json({ error: err.message || "Signup failed." });
  }
});

// --- LOGIN ---
router.post("/users/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: { code: "MISSING_FIELDS", message: "Email and password are required." },
      });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." },
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." },
      });
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "changeme",
      { expiresIn: "1d" }
    );

    return res.json({ token });
  } catch (err: any) {
    res.status(500).json({
      error: { code: "LOGIN_ERROR", message: err.message || "Login failed." },
    });
  }
});

// --- BOOKS ---
router.get("/books", async (_req: Request, res: Response) => {
  const books = await getBooks();
  res.json(books);
});

router.get("/books/search/:searchQuery", async (req: Request, res: Response) => {
  let { searchQuery } = req.params;
  if (Array.isArray(searchQuery)) searchQuery = searchQuery[0];
  const books = await searchBooks(searchQuery);
  res.json(books);
});

// --- CREATE REVIEW ---
router.post("/books/:bookId/reviews", async (req: Request, res: Response) => {
  try {
    const { rating, comment } = req.body;
    const bookIdParam = Array.isArray(req.params.bookId)
      ? req.params.bookId[0]
      : req.params.bookId;

    if (!rating || !comment) {
      return res.status(400).json({ error: "Rating and comment are required." });
    }

    // --- get userId from JWT ---
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token required." });
    }
    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "changeme");
    } catch {
      return res.status(401).json({ error: "Invalid token." });
    }

    const review = await createReview({
      bookId: bookIdParam,
      userId: decoded.userId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create review." });
  }
});

// --- FAQS ---
router.get("/faqs", async (_req: Request, res: Response) => {
  const faqs = await getFaqs();
  res.json(faqs);
});

// --- LIBRARIES & HOURS ---
router.get("/hourslocations", async (_req: Request, res: Response) => {
  const libraries = await getHoursLocations();
  res.json({ libraries });
});

// --- ROOT ---
router.get("/", (_req: Request, res: Response) => {
  res.json({ ok: true, message: "SimplyManage API" });
});

export default router;