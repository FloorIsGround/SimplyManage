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
import CatalogSearchBar from '../Header/CatalogSearchBar';
import type { Book } from '../../Models/Book/Book';
import BookDetails from './BookDetails';
import BookCover from './BookCover';

export interface BookListProps {
  results: Book[];
  loading: boolean;
  error?: string | undefined;
  open: boolean;
  onClose: () => void;
  showNoResultsImmediately?: boolean;
}

const BookList: React.FC<BookListProps> = ({
  results,
  loading,
  error,
  open,
  onClose,
  showNoResultsImmediately = false
}) => {
  const theme = useTheme();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(loading);
  const [resultsError, setResultsError] = useState(error);
  const [searchResults, setSearchResults] = useState(results);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResultsLoading(loading);
    setSearchResults(results);
    setResultsError(error);
  }, [results, loading, error])

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedBook(null);
  }

  function BookList() {
    if (resultsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (resultsError) {
      return (
        <Typography color="error" sx={{ textAlign: 'center' }}>
          {typeof resultsError === 'string'
            ? resultsError
            : resultsError && typeof resultsError === 'object' && 'message' in resultsError
              ? (resultsError as any).message
              : String(resultsError)}
        </Typography>
      );
    }

    if (searchResults.length === 0) {
      if (showNoResultsImmediately || hasSearched) {
        return <Typography variant="body2" sx={{ textAlign: 'center' }}>No results found.</Typography>;
      } else {
        return null;
      }
    }

    return (
      <List>
        {searchResults.map((book) => (
          <ListItemButton key={book.id} onClick={() => handleBookClick(book)} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 72, mr: 2, flexShrink: 0 }}>
              <BookCover isbn={String(book.isbn)} alt={book.title} />
            </Box>
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
              onSearchFailure={(err) => { setResultsError(err); setHasSearched(true); }}
              onSearchLoading={(isLoading) => { setResultsLoading(isLoading); }}
              onSearchSuccess={(results: Book[]) => { setSearchResults(results); setHasSearched(true); }}
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
            {BookList()}
          </Box>
        </Box>
      </Drawer>
      <BookDetails
        modalOpen={modalOpen}
        selectedBook={selectedBook}
        onModalClose={() => {
          handleModalClose();
        }}
      />
    </>
  );
};

export default BookList;
