import { TextField, IconButton, useTheme, Box, Button, Dialog, Divider, Rating, Typography } from "@mui/material";
import { useState } from "react";
import { useBookReviews } from "./Reviews/useBookReviews";

import CloseIcon from '@mui/icons-material/Close';
import BookCover from "./BookCover";
/* Removed, no longer necessary as all related functions have been separated and migrated.
Kept just in case axios is needed for any calls in the future.
import axiosServices from "../../utils/axios-api";
*/
import ReviewList from "./Reviews/ReviewList";
import WriteReview from "./Reviews/WriteReview";

import type { Book, Review } from "../../Models/Book/Book";

export interface BookDetailsProps {
  modalOpen: boolean;
  selectedBook: Book | null;
  onModalClose(): void;
}

enum ActiveTabEnum {
  details = "Details",
  copiesAvailable = "Copies Available",
  reviews = "Reviews",
  writeAReview = "Write a Review"
}

// Completely removed all reviews functions and migrated them to their own models.
function BookDetails({ modalOpen, onModalClose, selectedBook }: BookDetailsProps) {
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState<ActiveTabEnum>(ActiveTabEnum.details);

  // Load reviews using the custom hook
  const { reviews, setReviews } = useBookReviews(selectedBook?.id ?? null);

  // Callback for WriteReview component
  function handleReviewAdded(newReview: Review) {
    setReviews((prev) => [newReview, ...prev]);
  }

  const handleModalClose = () => {
    setActiveTab(ActiveTabEnum.details);
    onModalClose();
  };

  return (
    <Dialog
      open={modalOpen}
      onClose={handleModalClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            boxShadow: "none",
            backgroundImage: "none",
            display: "flex",
            flexDirection: "row",
            height: "95vh",
            overflow: "visible"
          }
        }
      }}
    >
      {selectedBook && (
        <>
          {/* Sidebar */}
          <Box
            sx={{
              width: 160,
              borderRight: "1px solid #ddd",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2
            }}
          >
            <BookCover isbn={selectedBook.isbn} alt={selectedBook.title + " Book Cover"} />

            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: theme.palette.primary.main, textAlign: "center", mb: 0 }}
              >
                Average Rating
              </Typography>
              <Rating value={selectedBook.averageRating} readOnly />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                width: "100%",
                alignSelf: "flex-start",
                mt: 3
              }}
            >
              {Object.values(ActiveTabEnum).map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "contained" : "text"}
                  onClick={() => setActiveTab(tab as ActiveTabEnum)}
                >
                  {tab}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Main content */}
          <Box sx={{ flex: 1, p: 3, position: "relative", height: "100%" }}>
            <IconButton sx={{ position: "absolute", top: 8, right: 8 }} onClick={handleModalClose}>
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

            {/* DETAILS TAB */}
            {activeTab === ActiveTabEnum.details && (
              <Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Summary
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedBook.description}
                </Typography>
                <Typography variant="body2">Genre: {selectedBook.genre}</Typography>
                <Typography variant="body2">Published: {selectedBook.publicationYear}</Typography>
              </Box>
            )}

            {/* COPIES TAB */}
            {activeTab === ActiveTabEnum.copiesAvailable && (
              <Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Copies Available
                </Typography>
                <Typography variant="body2">Main Branch — 3 available</Typography>
                <Typography variant="body2">East Branch — 1 available</Typography>
              </Box>
            )}

            {/* REVIEWS TAB */}
            {activeTab === ActiveTabEnum.reviews && (
              <Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Reviews
                </Typography>
                <ReviewList reviews={reviews} />
              </Box>
            )}

            {/* WRITE REVIEW TAB */}
            {activeTab === ActiveTabEnum.writeAReview && selectedBook && (
              <WriteReview bookId={selectedBook.id} onReviewAdded={handleReviewAdded} />
            )}
          </Box>
        </>
      )}
    </Dialog>
  );
}

export default BookDetails;
