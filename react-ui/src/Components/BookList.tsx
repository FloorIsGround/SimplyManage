import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItemText,
  CircularProgress,
  ListItemButton,
  useTheme,
  Button,
  Divider,
  Dialog,
  Rating,
  TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CatalogSearchBar from './Header/CatalogSearchBar';
import type { Book } from '../Models/Book/Book';
import BookCover from './BookCover';

export interface BookListProps {
  results: Book[];
  loading: boolean;
  error?: string | undefined;
  open: boolean;
  onClose: () => void;
}

enum ActiveTabEnum {
  details = 'Details',
  copiesAvailable = 'Copies Available',
  reviews = 'Reviews',
  writeAReview = 'Write a Review'
}

const BookList: React.FC<BookListProps> = ({
  results,
  loading,
  error,
  open,
  onClose
}) => {
  const theme = useTheme();

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTabEnum>(ActiveTabEnum.details);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedBook(null);
    setActiveTab(ActiveTabEnum.details);
    setReviewName('');
    setReviewText('');
  }

  function renderResults() {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return <Typography color="error" sx={{ textAlign: 'center' }}>{error}</Typography>;
    }

    if (results.length === 0) {
      return <Typography variant="body2" sx={{ textAlign: 'center' }}>No results found.</Typography>;
    }

    return (
      <List>
        {results.map((book) => (
          <ListItemButton key={book.id} onClick={() => handleBookClick(book)}>
            <ListItemText primary={book.title} secondary={book.author} />
          </ListItemButton>
        ))}
      </List>
    );
  }

  return (
    <>
      {/* Search Results */}
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{ paper: { sx: { width: '80vw' } } }}
      >
        <Box sx={{ p: 2, pt: 2, boxSizing: 'border-box' }}>
          <IconButton
            aria-label="close drawer"
            onClick={onClose}
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
          >
            <CloseIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>
            <CatalogSearchBar
              onSearchFailure={() => {}}
              onSearchLoading={() => {}}
              onSearchSucess={() => {}}
            />
          </Box>
          <Box
            sx={{
              width: '100%',
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              mt: 2
            }}
          >
            <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
              Search Results
            </Typography>
          </Box>
          <Box sx={{ p: 2, overflowY: 'auto', maxHeight: 'calc(100vh - 180px)' }}>
            {renderResults()}
          </Box>
        </Box>
      </Drawer>
      {/* Book Details */}
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
              height: '80vh',
              overflow: 'hidden'
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
                <Typography variant="subtitle2" sx={{ color: (theme) => theme.palette.primary.main, textAlign: 'center', mb: 0 }}>
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
            <Box sx={{ flex: 1, p: 3, overflowY: 'auto', position: 'relative' }}>
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
    </>
  );
};

export default BookList;
