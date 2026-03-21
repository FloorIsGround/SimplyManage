import type { NextFunction, Request, Response } from "express";
import {
		createReview,
		deleteReview,
		getReviewsByBookId,
		updateReview,
} from "../models/review/reviewQueries.js";
import {
		createHttpError,
		requirePositiveInt,
		requireRating,
		requireUuid,
} from "./controllerHelpers.js";

// Gets all reviews for one book.
export async function getReviewsForBook(req: Request, res: Response, next: NextFunction) {
		try {
	const bookId = requireUuid(req.params.bookId, "bookId");
	const reviews = await getReviewsByBookId(bookId);

	return res.json(reviews);
		} catch (err) {
	next(err);
		}
}

// Creates a new review.
export async function postReview(req: Request, res: Response, next: NextFunction) {
		try {
	const userId = requireUuid(req.body.userId, "userId");
	const bookId = requireUuid(req.body.bookId, "bookId");
	const rating = requireRating(req.body.rating);
	const comment = req.body.comment == null ? null : String(req.body.comment);

	const newReview = await createReview({
			userId,
			bookId,
			rating,
			comment,
	});

	return res.status(201).json(newReview);
		} catch (err) {
	next(err);
		}
}

// Updates rating and/or comment for an existing review.
export async function patchReview(req: Request, res: Response, next: NextFunction) {
		try {
	const reviewId = requirePositiveInt(req.params.id, "review id");
	const { rating, comment } = req.body;

	if (rating === undefined && comment === undefined) {
			throw createHttpError(400, "At least one of rating or comment must be provided.");
	}

	const updateData: { rating?: number; comment?: string | null } = {};

	if (rating !== undefined) {
			updateData.rating = requireRating(rating);
	}

	if (comment !== undefined) {
			updateData.comment = comment === null ? null : String(comment);
	}

	const updatedReview = await updateReview(reviewId, updateData);

	if (!updatedReview) {
			throw createHttpError(404, "Review not found.");
	}

	return res.json(updatedReview);
		} catch (err) {
	next(err);
		}
}

// Deletes a review by id.
export async function removeReview(req: Request, res: Response, next: NextFunction) {
		try {
	const reviewId = requirePositiveInt(req.params.id, "review id");
	const deleted = await deleteReview(reviewId);

	if (!deleted) {
			throw createHttpError(404, "Review not found.");
	}

	return res.json({ message: "Review deleted successfully." });
		} catch (err) {
	next(err);
		}
}