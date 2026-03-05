import { TextField, IconButton, useTheme, Box, Button, Dialog, Divider, Rating, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import BookCover from "./BookCover";
import type { Book } from "../Models/Book/Book";
import { useState } from "react";

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
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');


  const handleModalClose = () => {
    setActiveTab(ActiveTabEnum.details);
    setReviewName('');
    setReviewText('');
    onModalClose();
  }

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
              {/* Book Cover */}
              <BookCover isbn={selectedBook.isbn} alt={selectedBook.title + ' Book Cover'} />
              {/* Rating */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, textAlign: 'center', mb: 0 }}>
                  Average Rating
                </Typography>
                <Rating defaultValue={selectedBook.averageRating} readOnly />
              </Box>
              {/* Navigation */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', alignSelf: 'flex-start', mt: 3 }}>
                <Button
                  variant={activeTab === ActiveTabEnum.details ? 'contained' : 'text'}
                  onClick={() => setActiveTab(ActiveTabEnum.details)}
                  sx={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%', minWidth: 0, px: 1 }}
                >
                  {ActiveTabEnum.details}
                </Button>
                <Button
                  variant={activeTab === ActiveTabEnum.copiesAvailable ? 'contained' : 'text'}
                  onClick={() => setActiveTab(ActiveTabEnum.copiesAvailable)}
                  sx={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%', minWidth: 0, px: 1 }}
                >
                  {ActiveTabEnum.copiesAvailable}
                </Button>
                <Button
                  variant={activeTab === ActiveTabEnum.reviews ? 'contained' : 'text'}
                  onClick={() => setActiveTab(ActiveTabEnum.reviews)}
                  sx={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%', minWidth: 0, px: 1 }}
                >
                  {ActiveTabEnum.reviews}
                </Button>
                <Button
                  variant={activeTab === ActiveTabEnum.writeAReview ? 'contained' : 'text'}
                  onClick={() => setActiveTab(ActiveTabEnum.writeAReview)}
                  sx={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%', minWidth: 0, px: 1 }}
                >
                  {ActiveTabEnum.writeAReview}
                </Button>
              </Box>
            </Box>
            <Box sx={{ flex: 1, p: 3, position: 'relative', height: '100%' }}>
              <IconButton
                sx={{ position: 'absolute', top: 8, right: 8 }}
                onClick={handleModalClose}
              >
                <CloseIcon />
              </IconButton>
              {/* Title & Author */}
              <Box>
                <Typography variant="h4">{selectedBook.title}</Typography>
                <Typography variant="h6" color="text.secondary">
                  {selectedBook.author}
                </Typography>
                <Button variant="contained" color="primary" sx={{ mt: 2, justifyContent: 'flex-start', textAlign: 'left' }}>
                  Place Hold
                </Button>
              </Box>
              <Divider sx={{ my: 2 }} />
              {/* Content */}
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
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    “Great read!” — User123
                  </Typography>
                  <Typography variant="body2">
                    “Loved the characters.” — BookFan89
                  </Typography>
                </Box>
              )}
              {activeTab === ActiveTabEnum.writeAReview && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body1">
                    Write a Review
                  </Typography>
                  <Box>
                    <Rating defaultValue={0} precision={0.5} size='large'/>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="subtitle2">
                      Name
                    </Typography>
                    <TextField
                      variant="outlined"
                      fullWidth
                      value={reviewName}
                      onChange={e => setReviewName(e.target.value)}
                      placeholder="Enter your name"
                      size="small"
                      slotProps={{ input: { style: { fontSize: 16 } } }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="subtitle2">
                      Review
                    </Typography>
                    <TextField
                      variant="outlined"
                      fullWidth
                      multiline
                      minRows={4}
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      placeholder="Write your review here..."
                      slotProps={{ input: { style: { fontSize: 16 } } }}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ alignSelf: 'flex-start' }}
                    // onClick={handleSubmitReview} // Implement this to save review
                  >
                    Submit Review
                  </Button>
                </Box>
              )}
            </Box>
          </>
        )}
      </Dialog>
  )
}

export default BookDetails
