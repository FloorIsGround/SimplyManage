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
  Dialog
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CatalogSearchBar from './Header/CatalogSearchBar';
import type { Book } from '../Models/Book/Book';
import BookRating from './BookRating';

export interface BookSearchResultProps {
  results: Book[];
  loading: boolean;
  error?: string | undefined;
  open: boolean;
  onClose: () => void;
}

const BookSearchResult: React.FC<BookSearchResultProps> = ({
  results,
  loading,
  error,
  open,
  onClose
}) => {
  const theme = useTheme();

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'copies' | 'reviews'>('details');

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedBook(null);
    setActiveTab('details');
  };

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
      {/* Drawer for search results */}
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

      {/* Book Details Dialog */}
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
            {/* LEFT COLUMN */}
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
              <img
                src={`https://covers.openlibrary.org/b/isbn/${selectedBook.isbn}-L.jpg`}
                alt="Curious George Book Cover"
                style={{
                  width: '100%',
                  borderRadius: 4,
                  objectFit: 'cover',
                  display: 'block'
                }}
              />

              {/* Rating */}
              <BookRating averageRating={selectedBook.averageRating} />

              {/* Navigation */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', alignSelf: 'flex-start', mt: 3 }}>
                <Button
                  variant={activeTab === 'details' ? 'contained' : 'text'}
                  onClick={() => setActiveTab('details')}
                  sx={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%', minWidth: 0, px: 1 }}
                >
                  Details
                </Button>
                <Button
                  variant={activeTab === 'copies' ? 'contained' : 'text'}
                  onClick={() => setActiveTab('copies')}
                  sx={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%', minWidth: 0, px: 1 }}
                >
                  Copies Available
                </Button>
                <Button
                  variant={activeTab === 'reviews' ? 'contained' : 'text'}
                  onClick={() => setActiveTab('reviews')}
                  sx={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%', minWidth: 0, px: 1 }}
                >
                  Reviews
                </Button>
              </Box>
            </Box>

            {/* RIGHT COLUMN */}
            <Box sx={{ flex: 1, p: 3, overflowY: 'auto', position: 'relative' }}>
              <IconButton
                sx={{ position: 'absolute', top: 8, right: 8 }}
                onClick={handleModalClose}
              >
                <CloseIcon />
              </IconButton>

              {/* Title + Author */}
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

              {/* TAB CONTENT */}
              {activeTab === 'details' && (
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

              {activeTab === 'copies' && (
                <Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Copies Available
                  </Typography>
                  <Typography variant="body2">Main Branch — 3 available</Typography>
                  <Typography variant="body2">East Branch — 1 available</Typography>
                </Box>
              )}

              {activeTab === 'reviews' && (
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
            </Box>
          </>
        )}
      </Dialog>
    </>
  );
};

export default BookSearchResult;