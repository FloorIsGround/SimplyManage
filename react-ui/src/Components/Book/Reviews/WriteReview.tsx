// react-ui/src/Components/Book/Reviews/WriteReview.tsx
import { useState } from "react";
import { Box, Button, Rating, TextField, Typography } from "@mui/material";
import axiosServices from "../../../utils/axios-api";
import type { Review } from "../../../Models/Book/Book";

interface Props {
  bookId: string;
  onReviewAdded(review: Review): void;
}

export default function WriteReview({ bookId, onReviewAdded }: Props) {
  const [rating, setRating] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!rating || !text) {
      setError("Please provide a rating and review.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to submit a review.");
        setLoading(false);
        return;
      }

      const res = await axiosServices.post(
        `/reviews`,
        { bookId, rating, comment: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newReview: Review = {
        ...res.data,
        firstName: "You",
        lastName: ""
      };

      onReviewAdded(newReview);
      setRating(null);
      setText("");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body1">Write a Review</Typography>

      <Rating value={rating} precision={0.5} size="large" onChange={(_, v) => setRating(v)} />

      <Typography variant="subtitle2">Review</Typography>
      <TextField
        fullWidth
        multiline
        minRows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your review here..."
      />

      <Button variant="contained" onClick={submit} disabled={loading}>
        {loading ? "Submitting..." : "Submit Review"}
      </Button>

      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
}