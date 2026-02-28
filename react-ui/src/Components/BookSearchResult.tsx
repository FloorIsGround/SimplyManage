import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItemText,
  CircularProgress,
  ListItemButton,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { Book } from '../Models/Book/Book';
import CatalogSearchBar from './Header/CatalogSearchBar';
import { Dialog } from '@mui/material';

export interface BookSearchResultProps {
  results: Book[];
  loading: boolean;
  error?: string | undefined;
  open: boolean;
  onClose: () => void;
}

const BookSearchResult: React.FC<BookSearchResultProps> = ({ results, loading, error, open, onClose }) => {
  const theme = useTheme();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(loading);
  const [resultsError, setResultsError] = useState(error);
  const [searchResults, setSearchResults] = useState(results);

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedBook(null);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResultsLoading(loading);
    setSearchResults(results);
    setResultsError(error);
  }, [results, loading, error])

  function renderResults() {
    if (resultsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return <Typography color="error" sx={{ textAlign: 'center' }}>{resultsError}</Typography>;
    }

    if (searchResults.length === 0) {
      return <Typography variant="body2" sx={{ textAlign: 'center' }}>No results found.</Typography>;
    }

    return (
      <List>
        {searchResults.map((book) => (
          <ListItemButton key={book.id} onClick={() => handleBookClick(book)}>
            <ListItemText primary={book.title} secondary={book.author} />
          </ListItemButton>
        ))}
      </List>
    );
  }

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{ paper: { sx: { width: '80vw' } } }}
      >
        <Box sx={{ p: 2, pt: 2, boxSizing: 'border-box' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CatalogSearchBar
              onSearchFailure={(err) => {setResultsError(err)}}
              onSearchLoading={(isLoading) => {setResultsLoading(isLoading)}}
              onSearchSucess={(results) => {setSearchResults(results)}}
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
      {/* Book details dialog */}
      <Dialog open={modalOpen} onClose={handleModalClose} maxWidth="sm" fullWidth>
        <Box sx={{ position: 'relative', p: 4 }}>
          <IconButton sx={{ position: 'absolute', top: 8, right: 8 }} onClick={handleModalClose}>
            <CloseIcon />
          </IconButton>
          {selectedBook && (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>{selectedBook.title}</Typography>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Author: {selectedBook.author}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>Genre: {selectedBook.genre}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>Published: {selectedBook.publicationYear}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>{selectedBook.description}</Typography>
            </>
          )}
        </Box>
      </Dialog>
    </>
  );
};

export default BookSearchResult;