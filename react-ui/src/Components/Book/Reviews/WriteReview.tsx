// react-ui/src/Components/Book/Reviews/WriteReview.tsx

import { useState } from "react";
import { Box, Button, Rating, TextField, Typography } from "@mui/material";
import axiosServices from "../../../utils/axios-api";
import type { Review } from "../../../Models/Book/Book";

interface Props {
    bookId: string;                     // ID of the book being reviewed
    onReviewAdded(review: Review): void; // Callback to notify parent when a new review is submitted
}

/*
  WriteReview Component
  ---------------------
  Handles the UI and logic for submitting a new review.

  Responsibilities:
    • Collect rating + review text from the user
    • Validate input before submitting
    • Send POST request to backend
    • Return the newly created review to the parent component
    • Display loading + error states

  This component does NOT fetch existing reviews — that is handled
  by the useBookReviews hook. This keeps concerns cleanly separated.
*/
export default function WriteReview({ bookId, onReviewAdded }: Props) {

    // User-selected star rating (0.5 increments)
    const [rating, setRating] = useState<number | null>(null);

    // Review text input
    const [text, setText] = useState("");

    // Error message to display under the form
    const [error, setError] = useState<string | null>(null);

    // Tracks whether the review is currently being submitted
    const [loading, setLoading] = useState(false);

    /*
      submit()
      --------
      Validates input, sends the POST request, and returns the new review
      to the parent component via onReviewAdded().
    */
    async function submit() {
        // Basic validation
        if (!rating || !text) {
            setError("Please provide a rating and review.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Ensure the user is logged in
            const token = localStorage.getItem("token");
            if (!token) {
                setError("You must be logged in to submit a review.");
                setLoading(false);
                return;
            }

            // Submit the review to the backend
            const res = await axiosServices.post(
                `/reviews`,
                { bookId, rating, comment: text },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            /*
              The backend does not return first/last name for the reviewer.
              Since this user just submitted the review, we label it as "You".
            */
            const newReview: Review = {
                ...res.data,
                firstName: "You",
                lastName: ""
            };

            // Notify parent component so it can update the review list
            onReviewAdded(newReview);

            // Reset form fields
            setRating(null);
            setText("");

        } catch (err: any) {
            // Display backend error message if available
            setError(err?.response?.data?.error || "Failed to submit review.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body1">Write a Review</Typography>

            {/* Star rating input */}
            <Rating
                value={rating}
                precision={0.5}
                size="large"
                onChange={(_, v) => setRating(v)}
            />

            <Typography variant="subtitle2">Review</Typography>

            {/* Review text input */}
            <TextField
                fullWidth
                multiline
                minRows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write your review here..."
            />

            {/* Submit button */}
            <Button variant="contained" onClick={submit} disabled={loading}>
                {loading ? "Submitting..." : "Submit Review"}
            </Button>

            {/* Error message */}
            {error && <Typography color="error">{error}</Typography>}
        </Box>
    );
}