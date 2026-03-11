import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Button, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import BookCover from "../Book/BookCover";
import BookDetails from "../Book/BookDetails";
import axiosServices from "../../utils/axios-api";
import type { Book } from "../../Models/Book/Book";
import EventList from "./EventList";

function Homepage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openBookDetails, setOpenBookDetails] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    axiosServices.get("/books?sort=createdAt&order=desc&limit=10")
      .then(res => {
        setBooks(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load new arrivals.");
        setLoading(false);
      });
  }, []);

  return (
    <>
      {/* New Arrivals */}
      <Box sx={{ width: '100%', py: 6 }}>
        <Box sx={{ maxWidth: 1600, mx: 'auto', px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0, bgcolor: 'primary.main', borderRadius: 2, px: 2, py: 1 }}>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 400, fontFamily: 'inherit', mb: 0 }}>
              New Arrivals
            </Typography>
          </Box>
            <Box sx={{ minHeight: 260, borderRadius: 3, p: 3, position: 'relative' }}>
              {(() => {
                let content;
                if (loading) {
                  content = (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 180 }}>
                      <CircularProgress size={40} />
                    </Box>
                  );
                } else if (error) {
                  content = <Typography color="error">{error}</Typography>;
                } else if (books.length === 0) {
                  content = <Typography>No new arrivals found.</Typography>;
                } else {
                  content = (
                    <>
                      <IconButton
                        aria-label="scroll left"
                        onClick={() => {
                          const el = document.getElementById('book-scroll-row');
                          if (el) el.scrollBy({ left: -350, behavior: 'smooth' });
                        }}
                        sx={{
                          position: 'absolute',
                          left: 8,
                          top: '50%',
                          zIndex: 2,
                          transform: 'translateY(-50%)',
                          bgcolor: 'background.paper',
                          boxShadow: 2,
                          '&:hover': { bgcolor: 'primary.light' },
                        }}
                      >
                        <ChevronLeftIcon fontSize="large" />
                      </IconButton>
                      <Box
                        id="book-scroll-row"
                        sx={{
                          display: 'flex',
                          overflowX: 'auto',
                          gap: 3,
                          scrollBehavior: 'smooth',
                          px: 3,
                          py: 1,
                          '::-webkit-scrollbar': { display: 'none' },
                          msOverflowStyle: 'none',
                          scrollbarWidth: 'none',
                        }}
                      >
                        <Box sx={{ width: 7, pointerEvents: 'none' }} />
                        {books.slice(0, 15).map(book => (
                          <Box
                            onClick={() => {
                              setOpenBookDetails(true);
                              setSelectedBook(book);
                            }}
                            key={book.id}
                            sx={{
                              minWidth: 120,
                              maxWidth: 120,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              bgcolor: '#FAFAFA',
                              borderRadius: 2,
                              boxShadow: 2,
                              p: 2,
                            }}
                          >
                            <Box sx={{ width: 120, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, borderRadius: 1, overflow: 'hidden', boxShadow: 2 }}>
                              <BookCover isbn={book.isbn} alt={book.title} />
                            </Box>
                            <Typography align="center" sx={{ fontSize: 15, fontWeight: 600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'primary.main', mb: 0.5 }}>
                              {book.title}
                            </Typography>
                            <Typography align="center" sx={{ fontSize: 12, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {book.author}
                            </Typography>
                          </Box>
                        ))}
                        <Box sx={{ width: 16, pointerEvents: 'none' }} />
                      </Box>
                      <IconButton
                        aria-label="scroll right"
                        onClick={() => {
                          const el = document.getElementById('book-scroll-row');
                          if (el) el.scrollBy({ left: 350, behavior: 'smooth' });
                        }}
                        sx={{
                          position: 'absolute',
                          right: 8,
                          top: '50%',
                          zIndex: 2,
                          transform: 'translateY(-50%)',
                          bgcolor: 'background.paper',
                          boxShadow: 2,
                          '&:hover': { bgcolor: 'primary.light' },
                        }}
                      >
                        <ChevronRightIcon fontSize="large" />
                      </IconButton>
                    </>
                  );
                }
                return content;
              })()}
              {books.length > 10 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button variant="outlined" color="primary" size="small">View All</Button>
                </Box>
              )}
            </Box>
        </Box>
      </Box>
        <BookDetails 
          modalOpen={openBookDetails}
        selectedBook={selectedBook}
        onModalClose={() => {
          setOpenBookDetails(false);
          setSelectedBook(null);
        }}
        />
      {/* Upcoming Events */}
      <Box sx={{
        width: '100%',
        py: 4,
        mb: 0
      }}>
        <Box sx={{ maxWidth: 1600, mx: 'auto', px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, bgcolor: 'primary.main', borderRadius: 2, px: 2, py: 1 }}>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 400, fontFamily: 'inherit', mb: 0 }}>{"Upcoming Events"}</Typography>
          </Box>
          <Box sx={{ minHeight: 120, borderRadius: 3, p: 0 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
              {events.map((event, idx) => (
                <Box
                  key={idx}
                  sx={{
                    minWidth: 260,
                    maxWidth: 320,
                    flex: '1 1 260px',
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    boxShadow: 2,
                    p: 2,
                    borderLeft: '6px solid',
                    borderColor: 'primary.main',
                    display: 'flex',
                    flexDirection: 'column',
                    mb: 1,
                    minHeight: 180,
                    justifyContent: 'space-between',
                    '&:hover': {
                      boxShadow: 5,
                      transform: 'translateY(-2px) scale(1.02)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarTodayIcon sx={{ fontSize: 18, color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, fontFamily: 'inherit' }}>
                      {event.title}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 15, fontFamily: 'inherit', mb: 1 }}>
                    {event.date} &bull; {event.time}
                  </Typography>
                  <Typography sx={{ fontSize: 15, fontFamily: 'inherit', mb: 2 }}>{event.description}</Typography>
                  <Button variant="outlined" color="primary" size="small" sx={{ alignSelf: 'flex-end', mt: 'auto' }}>
                    Learn More
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default Homepage;
