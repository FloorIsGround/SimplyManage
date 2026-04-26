import SignUp from '../../../SignUp/SignUp';
import AddBookForm from '../../../Book/AddBookForm';
import React, { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import StaffDashboardLayout from '../StaffDashboardLayout';
import BookList from '../../../Book/BookList';
import type { User } from '../../../../Models/User/User';
import type { Book } from '../../../../Models/Book/Book';
import type { Copy } from '../../../../Models/Book/Copy';
import { useBranches } from '../../../LibraryInfo/useBranches';
import type { Library } from '../../../../Models/LibraryInfo/Library';
import axios from '../../../../utils/axios-api';
import { jwtDecode } from 'jwt-decode';
import {
  ThemeProvider, Typography, Box, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions, Badge, CircularProgress, Snackbar, Alert
} from '@mui/material';
import theme from '../../../../utils/theme';

{ /* CheckoutButton component */}
interface CheckoutButtonProps {
  selectedPatron: User | null;
  selectedCopy: Copy | null;
  selectedBranch: Library | null;
  onSuccess: () => void;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ selectedPatron, selectedCopy, selectedBranch, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCheckout = async () => {
    if (!selectedPatron || !selectedCopy || !selectedBranch) return;
    setLoading(true);
    setError(null);
    try {
      // Calculate due date (2 weeks from checkout)
      const dueAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      await axios.post('/loans', {
        userId: selectedPatron.id,
        copyId: selectedCopy.id,
        barcode: selectedCopy.barcode,
        branchId: selectedBranch.id,
        dueAt,
      });
      setSuccess(true);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        disabled={loading || !selectedPatron || !selectedCopy || !selectedBranch}
        onClick={handleCheckout}
        startIcon={loading ? <CircularProgress size={18} /> : null}
      >
        Checkout
      </Button>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess(false)} sx={{ width: '100%' }}>
          Checkout successful!
        </Alert>
      </Snackbar>
    </>
  );
};

const stats = [
  { label: 'Total Books', value: 3026 },
  { label: 'Total Copies', value: 6010 },
  { label: 'Items Checked Out', value: 1875 },
  { label: 'Active Patrons', value: 920 },
];

const quickActions = [
  { label: 'Checkout' },
  { label: 'Return' },
  { label: 'Search Patron' },
  { label: 'Search Book' },
  { label: 'Add Book' },
  { label: 'Add Patron' },
];

const circulationAlerts = [
  { label: 'Overdue Items', count: 2 },
  { label: 'Holds', count: 15 },
  { label: 'Lost Copies', count: 3 },
  { label: 'Damaged Copies', count: 2 },
  { label: 'Items in Maintenance', count: 5 },
];

const DashboardPage: React.FC = () => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [openAddPatron, setOpenAddPatron] = useState(false);
  const [openSearchBook, setOpenSearchBook] = useState(false);
  const [openAddBook, setOpenAddBook] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [selectedPatron, setSelectedPatron] = useState<User | null>(null);
  const [patronsLoading, setPatronsLoading] = useState(false);
  const [patronsError, setPatronsError] = useState<string | null>(null);
  const [pendingPatronCardNumber, setPendingPatronCardNumber] = useState('');
  const { branches, loading: branchesLoading, error: branchesError } = useBranches();
  const [selectedBranch, setSelectedBranch] = useState<Library | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedCopy, setSelectedCopy] = useState<Copy | null>(null);
  const [booksLoading, setBooksLoading] = useState(false);
  const [booksError, setBooksError] = useState<string | null>(null);
  const [pendingBookBarcode, setPendingBookBarcode] = useState('');
    
  // Fetch patrons and books when checkout dialog opens
    useEffect(() => {
      if (openDialog === 'Checkout') {
        setSelectedPatron(null);
        setPatronsError(null);
        setSelectedBook(null);
        setSelectedCopy(null);
        setBooksError(null);
        setPendingPatronCardNumber('');
        setPendingBookBarcode('');
      }
    }, [openDialog]);

    const handlePatronSearch = async () => {
      setPatronsLoading(true);
      setPatronsError(null);
      setSelectedPatron(null);
      if (!pendingPatronCardNumber) {
        setPatronsLoading(false);
        return;
      }
      try {
          const url = `/users?role=patron&cardNumber=${encodeURIComponent(pendingPatronCardNumber)}`;
          const res = await axios.get(url);
          if (res.data && res.data.length > 0) {
            const exact = res.data.find((u: any) => u.libraryCardNumber === pendingPatronCardNumber);
            if (exact) {
              setSelectedPatron(exact);
            } else {
              setSelectedPatron(null);
              setPatronsError('No patron found with that card number.');
            }
          } else {
            setSelectedPatron(null);
            setPatronsError('No patron found with that card number.');
          }
        } catch {
          setSelectedPatron(null);
          setPatronsError('Failed to load patron.');
        } finally {
          setPatronsLoading(false);
      }
    };

    const handleBookSearch = async () => {
      setBooksLoading(true);
      setBooksError(null);
      setSelectedBook(null);
      setSelectedCopy(null);
      if (!pendingBookBarcode) {
        setBooksLoading(false);
        return;
      }
      try {
        const copyRes = await axios.get(`/copies/barcode/${encodeURIComponent(pendingBookBarcode)}`);
        const copy: Copy = copyRes.data;
        setSelectedCopy(copy);
        const bookRes = await axios.get(`/books/${copy.bookId}`);
        setSelectedBook(bookRes.data);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setBooksError('No copy found with that barcode.');
        } else {
          setBooksError('Failed to load book.');
        }
      } finally {
        setBooksLoading(false);
      }
    };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setTimeout(() => {
        setUser(null);
        setLoading(false);
        setError('Not logged in.');
      }, 0);
      return;
    }
    let userId = undefined;
    try {
      const decoded: any = jwtDecode(token);
      userId = decoded.id || decoded.userId || decoded._id;
    } catch {
      setTimeout(() => {
        setUser(null);
        setLoading(false);
        setError('Invalid token.');
      }, 0);
      return;
    }
    if (!userId) {
      setTimeout(() => {
        setUser(null);
        setLoading(false);
        setError('No user ID found in token.');
      }, 0);
      return;
    }
    axios.get(`/users/${userId}`)
      .then((res: any) => {
        setUser(res.data);
        setError(null);
      })
      .catch(() => {
        setUser(null);
        setError('Failed to load user.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleOpenDialog = (label: string) => {
    if (label === 'Add Patron') {
      setOpenAddPatron(true);
    } else if (label === 'Search Book') {
      setOpenSearchBook(true);
    } else if (label === 'Add Book') {
      setOpenAddBook(true);
    } else {
      setOpenDialog(label);
    }
  };
  const handleCloseDialog = () => {
    setOpenDialog(null);
    setSelectedBranch(null);
  };
  const handleCloseAddPatron = () => setOpenAddPatron(false);
  const handleCloseSearchBook = () => setOpenSearchBook(false);
  const handleCloseAddBook = () => setOpenAddBook(false);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Typography variant="h6">Loading...</Typography>
        </Box>
      </ThemeProvider>
    );
  }
  if (error || !user) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Typography variant="h6" color="error">{error || 'User not found.'}</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <StaffDashboardLayout user={user} pageTitle="SimplyManage">
        <Box sx={{ background: '#fff', borderRadius: 2, p: 4, boxShadow: 1, mt: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Staff Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Welcome to the staff dashboard! Here you can get an overview of library activity, stats, and quick actions.
          </Typography>
          {/* System Overview */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            System Overview
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
            {stats.map((stat) => (
              <Card key={stat.label} sx={{ minWidth: 180, flex: '1 1 180px', boxShadow: 0, border: '1px solid #eee', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
          {/* Quick Actions */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="contained"
                color="primary"
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, minWidth: 140, flex: '1 1 140px' }}
                onClick={() => handleOpenDialog(action.label)}
              >
                {action.label}
              </Button>
            ))}
            {/* Add Patron Dialog */}
            <Dialog
              open={openAddPatron}
              onClose={handleCloseAddPatron} maxWidth={false}
            >
              <SignUp />
            </Dialog>
            {/* Search Book Drawer */}
            <BookList
              results={[]}
              loading={false}
              open={openSearchBook}
              onClose={handleCloseSearchBook}
            />
            {/* Add Book Dialog */}
            <AddBookForm open={openAddBook} onClose={handleCloseAddBook} />
          </Box>
          {/* Circulation Alerts */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Circulation Alerts
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {circulationAlerts.map((alert) => (
              <Badge key={alert.label} badgeContent={alert.count} color="error" sx={{ flex: '1 1 140px', minWidth: 140 }}>
                <Button
                  variant="outlined"
                  color="error"
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, width: '100%' }}
                  onClick={() => handleOpenDialog(alert.label)}
                >
                  {alert.label}
                </Button>
              </Badge>
            ))}
          </Box>
          {/* Quick Action Dialogs */}
          <Dialog open={!!openDialog} onClose={handleCloseDialog}>
            <DialogTitle>{openDialog}</DialogTitle>
            <DialogContent>
              {openDialog === 'Checkout' ? (
                <Box sx={{ minWidth: 320, py: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Patron Card Number
                    </Typography>
                    <TextField
                      label="Library Card Number"
                      variant="outlined"
                      value={pendingPatronCardNumber}
                      onChange={e => setPendingPatronCardNumber(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handlePatronSearch();
                        }
                      }}
                      sx={{ mb: 2, width: '100%' }}
                      error={!!patronsError}
                      helperText={patronsError || ''}
                      disabled={patronsLoading}
                    />
                    {patronsLoading && <span>Loading...</span>}
                    {selectedPatron && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {selectedPatron.firstName} {selectedPatron.lastName} ({selectedPatron.cardNumber || selectedPatron.email})
                      </Typography>
                    )}
                  </div>
                  <div>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Book Barcode
                    </Typography>
                    <TextField
                      label="Book Barcode"
                      variant="outlined"
                      value={pendingBookBarcode}
                      onChange={e => setPendingBookBarcode(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleBookSearch();
                        }
                      }}
                      sx={{ mb: 2, width: '100%' }}
                      error={!!booksError}
                      helperText={booksError || ''}
                      disabled={booksLoading}
                    />
                    {booksLoading && <span>Loading...</span>}
                    {selectedBook && selectedCopy && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {selectedBook.title} by {selectedBook.author} (Barcode: {selectedCopy.barcode})
                      </Typography>
                    )}
                  </div>
                  <div>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Select Branch
                    </Typography>
                    <Autocomplete
                      options={branches}
                      getOptionLabel={(option) => option.name}
                      loading={branchesLoading}
                      value={selectedBranch}
                      onChange={(_, value) => setSelectedBranch(value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Branch"
                          variant="outlined"
                          error={!!branchesError}
                          helperText={branchesError || ''}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {branchesLoading ? <span style={{ marginRight: 8 }}>Loading...</span> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option && value && option.id === value.id}
                    />
                  </div>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <CheckoutButton
                      selectedPatron={selectedPatron}
                      selectedCopy={selectedCopy}
                      selectedBranch={selectedBranch}
                      onSuccess={() => {
                        setSelectedPatron(null);
                        setSelectedBook(null);
                        setSelectedCopy(null);
                        setSelectedBranch(null);
                        handleCloseDialog();
                      }}
                    />
                  </Box>
                </Box>
              ) : (
                <Typography>
                  This is a placeholder dialog for <b>{openDialog}</b>.<br />
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </StaffDashboardLayout>
    </ThemeProvider>
  );
};

export default DashboardPage;
