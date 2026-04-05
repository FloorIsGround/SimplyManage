// react-ui/src/Components/Book/Reviews/ReviewList.tsx
import { Box, Rating, Typography } from "@mui/material";
import type { Review } from "../../../Models/Book/Book";

/*
  ReviewList Component
  --------------------
  A simple presentational component responsible ONLY for rendering
  a list of reviews. It receives already-enriched review data
  (including first/last names) from the parent component or hook.

  This component contains no business logic — it simply displays
  what it is given. This keeps it reusable and easy to maintain.
*/

export default function ReviewList({ reviews }: { reviews: Review[] }) {
    // If there are no reviews, show a friendly message
    if (reviews.length === 0) {
        return <Typography variant="body2">No reviews yet.</Typography>;
    }

    return (
        <>
            {reviews.map((review) => (
                <Box key={review.id} sx={{ mb: 2 }}>

                    {/* Star rating for the review */}
                    <Rating value={review.rating} readOnly size="small" />

                    {/* Review text/comment */}
                    <Typography variant="body2">{review.comment}</Typography>

                    {/* Display reviewer name if available, otherwise fallback to userId */}
                    <Typography variant="caption" color="text.secondary">
                        {review.firstName && review.lastName
                            ? `${review.firstName} ${review.lastName}`
                            : "Anonymous User"}
                    </Typography>
                </Box>
            ))}
        </>
    );
}