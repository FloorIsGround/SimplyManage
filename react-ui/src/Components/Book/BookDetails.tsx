import { IconButton, useTheme, Box, Button, Dialog, Divider, Rating, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useBookReviews } from "./Reviews/useBookReviews";
import CloseIcon from '@mui/icons-material/Close';
import BookCover from "./BookCover";
import ReviewList from "./Reviews/ReviewList";
import WriteReview from "./Reviews/WriteReview";
import type { Book } from "../../Models/Book/Book";
import type { Copy } from "../../Models/Book/Copy";
import { ConditionStatus } from "../../Models/Book/Copy";
import axios from "../../utils/axios-api";

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

// Displays book details, copies available, and reviews functionality.
function BookDetails({ modalOpen, onModalClose, selectedBook }: BookDetailsProps) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTabEnum>(ActiveTabEnum.details);
  const { reviews, refreshReviews } = useBookReviews(selectedBook?.id ?? null);
  const [copies, setCopies] = useState<Copy[]>([]);
  const [loadingCopies, setLoadingCopies] = useState(false);

  useEffect(() => {
    if (selectedBook) {
      if (!loadingCopies) setLoadingCopies(true);
      axios.get(`/books/${selectedBook.id}/copies`)
        .then(res => setCopies(res.data))
        .catch(() => setCopies([]))
        .finally(() => setLoadingCopies(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBook]);

  const isAvailable = copies.some(copy => copy.conditionStatus === ConditionStatus.available);

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
            {/* Book Cover */}
            <BookCover isbn={String(selectedBook.isbn)} alt={selectedBook.title + " Book Cover"} />
            {/* Rating */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25 }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, textAlign: "center", mb: 0 }}>
                Average Rating
              </Typography>
              <Rating value={selectedBook.averageRating} precision={0.1} readOnly />
            </Box>
            {/* Navigation */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%", alignSelf: "flex-start", mt: 3
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
          {/* Content */}
          <Box sx={{ flex: 1, p: 3, position: "relative", height: "100%" }}>
            {/* Close button */}
            <IconButton sx={{ position: "absolute", top: 8, right: 8 }} onClick={handleModalClose}>
              <CloseIcon />
            </IconButton>
            {/* Title & Author */}
            <Box>
              <Typography variant="h4">{selectedBook.title}</Typography>
              <Typography variant="h6" color="text.secondary">
                {selectedBook.author}
              </Typography>
              {/* Checkout or Hold button based on availability */}
              {loadingCopies ? (
                <Button variant="contained" color="primary" sx={{ mt: 2 }} disabled>
                  Loading...
                </Button>
              ) : isAvailable ? (
                <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                  Check Out
                </Button>
              ) : (
                <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                  Place Hold
                </Button>
              )}
            </Box>
            <Divider sx={{ my: 2 }} />
            {/* Details */}
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
            {/* Copies */}
            {activeTab === ActiveTabEnum.copiesAvailable && (
              <Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Copies Available
                </Typography>
                <Typography variant="body2">Main Branch — {isAvailable ? "3 available" : "No copies available"}</Typography>
                <Typography variant="body2">East Branch — {isAvailable ? "1 available" : "No copies available"}</Typography>
              </Box>
            )}
            {/* Reviews */}
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
              <WriteReview bookId={selectedBook.id} onReviewAdded={refreshReviews} />
            )}
          </Box>
        </>
      )}
    </Dialog>
  )
}

export default BookDetails;
