import type { Request, Response } from "express";
import {
  createReview,
  deleteReview,
  getReviewsByBookId,
  updateReview,
} from "../models/review/reviewQueries.js";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function parseReviewId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function getSingleValue(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return null;
}

export async function getReviewsForBook(req: Request, res: Response) {
  try {
    const bookId = getSingleValue(req.params.bookId);

    if (!bookId || !isUuid(bookId)) {
      return res.status(400).json({ error: "Valid bookId is required." });
    }

    const reviews = await getReviewsByBookId(bookId);
    return res.json(reviews);
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || "Failed to fetch reviews.",
    });
  }
}

export async function postReview(req: Request, res: Response) {
  try {
    const userId = getSingleValue(req.body.userId);
    const bookId = getSingleValue(req.body.bookId);
    const commentRaw = req.body.comment;
    const rating = req.body.rating;

    if (!userId || !bookId || rating === undefined) {
      return res.status(400).json({
        error: "userId, bookId, and rating are required.",
      });
    }

    if (!isUuid(userId) || !isUuid(bookId)) {
      return res.status(400).json({
        error: "userId and bookId must be valid UUIDs.",
      });
    }

    const parsedRating = Number(rating);

    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        error: "Rating must be an integer between 1 and 5.",
      });
    }

    const newReview = await createReview({
      userId,
      bookId,
      rating: parsedRating,
      comment: commentRaw == null ? null : String(commentRaw),
    });

    return res.status(201).json(newReview);
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || "Failed to create review.",
    });
  }
}

export async function patchReview(req: Request, res: Response) {
  try {
    const idParam = getSingleValue(req.params.id);
    const reviewId = idParam ? parseReviewId(idParam) : null;

    if (!reviewId) {
      return res.status(400).json({ error: "Valid review id is required." });
    }

    const { rating, comment } = req.body;

    if (rating === undefined && comment === undefined) {
      return res.status(400).json({
        error: "At least one of rating or comment must be provided.",
      });
    }

    const updateData: { rating?: number; comment?: string | null } = {};

    if (rating !== undefined) {
      const parsedRating = Number(rating);

      if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({
          error: "Rating must be an integer between 1 and 5.",
        });
      }

      updateData.rating = parsedRating;
    }

    if (comment !== undefined) {
      updateData.comment = comment === null ? null : String(comment);
    }

    const updatedReview = await updateReview(reviewId, updateData);

    if (!updatedReview) {
      return res.status(404).json({ error: "Review not found." });
    }

    return res.json(updatedReview);
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || "Failed to update review.",
    });
  }
}

export async function removeReview(req: Request, res: Response) {
  try {
    const idParam = getSingleValue(req.params.id);
    const reviewId = idParam ? parseReviewId(idParam) : null;

    if (!reviewId) {
      return res.status(400).json({ error: "Valid review id is required." });
    }

    const deleted = await deleteReview(reviewId);

    if (!deleted) {
      return res.status(404).json({ error: "Review not found." });
    }

    return res.json({ message: "Review deleted successfully." });
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || "Failed to delete review.",
    });
  }
}