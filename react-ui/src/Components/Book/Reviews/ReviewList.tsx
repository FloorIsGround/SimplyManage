// react-ui/src/Components/Book/Reviews/ReviewList.tsx
import { Box, Rating, Typography } from "@mui/material";
import type { Review } from "../../../Models/Book/Book";

export default function ReviewList({ reviews }: { reviews: Review[] }) {
    if (reviews.length === 0) {
        return <Typography variant="body2">No reviews yet.</Typography>;
    }

    return (
        <>
            {reviews.map((review) => (
                <Box key={review.id} sx={{ mb: 2 }}>
                    <Rating value={review.rating} readOnly size="small" />
                    <Typography variant="body2">{review.comment}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {review.firstName && review.lastName
                            ? `${review.firstName} ${review.lastName}`
                            : `User ${review.userId}`}
                    </Typography>
                </Box>
            ))}
        </>
    );
}