import { TextField, IconButton, useTheme, Box, Button, Dialog, Divider, Rating, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import BookCover from "./BookCover";
import type { Book } from "../../Models/Book/Book";
import { useState } from "react";
import axiosServices from "../../utils/axios-api";

export interface BookDetailsProps {
  modalOpen: boolean;
  selectedBook: Book | null;
  onModalClose(): void;
}

enum ActiveTabEnum {
  details = 'Details',
  copiesAvailable = 'Copies Available',
  reviews = 'Reviews',
  writeAReview = 'Write a Review'
}

function BookDetails({modalOpen, onModalClose, selectedBook}: BookDetailsProps) {
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState<ActiveTabEnum>(ActiveTabEnum.details);

  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState<number | null>(0);

  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const handleModalClose = () => {
    setActiveTab(ActiveTabEnum.details);
    setReviewText('');
    setReviewRating(0);
    setReviewError(null);
    onModalClose();
  }

  const handleSubmitReview = async () => {
    if (!selectedBook) return;

    if (!reviewText || !reviewRating) {
      setReviewError("Please provide a rating and review.");
      return;
    }

    setReviewLoading(true);
    setReviewError(null);

    try {
      const token = localStorage.getItem("token"); // JWT stored on login
      if (!token) {
        setReviewError("You must be logged in to submit a review.");
        setReviewLoading(false);
        return;
      }

      await axiosServices.post(
        `/books/${selectedBook.id}/reviews`,
        { rating: reviewRating, comment: reviewText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReviewText("");
      setReviewRating(0);
      setActiveTab(ActiveTabEnum.reviews);
    } catch (err: any) {
      setReviewError(err?.response?.data?.error || "Failed to submit review.");
    } finally {
      setReviewLoading(false);
    }
  };

  return(
      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              boxShadow: 'none',
              backgroundImage: 'none',
              display: 'flex',
              flexDirection: 'row',
              height: '95vh',
              overflow: 'visible'
            }
          }
        }}
      >
        {selectedBook && (
          <>
            <Box
              sx={{
                width: 160,
                borderRight: '1px solid #ddd',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <BookCover isbn={selectedBook.isbn} alt={selectedBook.title + ' Book Cover'} />

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, textAlign: 'center', mb: 0 }}>
                  Average Rating
                </Typography>
                <Rating value={selectedBook.averageRating} readOnly />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', alignSelf: 'flex-start', mt: 3 }}>
                <Button
                  variant={activeTab === ActiveTabEnum.details ? 'contained' : 'text'}
                  onClick={() => setActiveTab(ActiveTabEnum.details)}
                >
                  {ActiveTabEnum.details}
                </Button>

                <Button
                  variant={activeTab === ActiveTabEnum.copiesAvailable ? 'contained' : 'text'}
                  onClick={() => setActiveTab(ActiveTabEnum.copiesAvailable)}
                >
                  {ActiveTabEnum.copiesAvailable}
                </Button>

                <Button
                  variant={activeTab === ActiveTabEnum.reviews ? 'contained' : 'text'}
                  onClick={() => setActiveTab(ActiveTabEnum.reviews)}
                >
                  {ActiveTabEnum.reviews}
                </Button>

                <Button
                  variant={activeTab === ActiveTabEnum.writeAReview ? 'contained' : 'text'}
                  onClick={() => setActiveTab(ActiveTabEnum.writeAReview)}
                >
                  {ActiveTabEnum.writeAReview}
                </Button>
              </Box>
            </Box>

            <Box sx={{ flex: 1, p: 3, position: 'relative', height: '100%' }}>
              <IconButton sx={{ position: 'absolute', top: 8, right: 8 }} onClick={handleModalClose}>
                <CloseIcon />
              </IconButton>

              <Box>
                <Typography variant="h4">{selectedBook.title}</Typography>
                <Typography variant="h6" color="text.secondary">
                  {selectedBook.author}
                </Typography>

                <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                  Place Hold
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              {activeTab === ActiveTabEnum.details && (
                <Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Summary
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedBook.description}
                  </Typography>

                  <Typography variant="body2">Genre: {selectedBook.genre}</Typography>
                  <Typography variant="body2">
                    Published: {selectedBook.publicationYear}
                  </Typography>
                </Box>
              )}

              {activeTab === ActiveTabEnum.copiesAvailable && (
                <Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Copies Available
                  </Typography>

                  <Typography variant="body2">Main Branch — 3 available</Typography>
                  <Typography variant="body2">East Branch — 1 available</Typography>
                </Box>
              )}

              {activeTab === ActiveTabEnum.reviews && (
                <Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Reviews
                  </Typography>

                  {selectedBook.reviews.length === 0 && (
                    <Typography variant="body2">No reviews yet.</Typography>
                  )}

                  {selectedBook.reviews.map((review) => (
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
                </Box>
              )}

              {activeTab === ActiveTabEnum.writeAReview && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body1">
                    Write a Review
                  </Typography>

                  <Rating
                    value={reviewRating}
                    precision={0.5}
                    size="large"
                    onChange={(_, value) => setReviewRating(value)}
                  />

                  <Typography variant="subtitle2">Review</Typography>

                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Write your review here..."
                  />

                  <Button
                    variant="contained"
                    onClick={handleSubmitReview}
                    disabled={reviewLoading}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {reviewLoading ? "Submitting..." : "Submit Review"}
                  </Button>

                  {reviewError && (
                    <Typography color="error">{reviewError}</Typography>
                  )}
                </Box>
              )}
            </Box>
          </>
        )}
      </Dialog>
  )
}

export default BookDetails;