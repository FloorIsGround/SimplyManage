import SignUp from '../../../SignUp/SignUp';
import AddBookForm from '../../../Book/AddBookForm';
import React, { useState } from 'react';
import StaffDashboardLayout from '../StaffDashboardLayout';
import BookList from '../../../Book/BookList';
import type { User } from '../../../../Models/User/User';
import { Role, UserStatus } from '../../../../Models/User/User';
import theme from '../../../../utils/theme';
import {
  ThemeProvider, Typography, Box, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions, Badge
} from '@mui/material';

const mockUser: User = {
  id: '1',
  email: 'admin@simplymanage.com',
  firstName: 'Admin',
  lastName: 'Chelsey',
  dateOfBirth: '1990-01-01',
  password: '',
  role: Role.admin,
  status: UserStatus.active,
  createdAt: new Date(),
  borrowedBooks: [],
};

const stats = [
  { label: 'Total Books', value: 12450 },
  { label: 'Total Copies', value: 30210 },
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
  { label: 'Overdue Items', count: 42 },
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
  const handleCloseDialog = () => setOpenDialog(null);
  const handleCloseAddPatron = () => setOpenAddPatron(false);
  const handleCloseSearchBook = () => setOpenSearchBook(false);
  const handleCloseAddBook = () => setOpenAddBook(false);

  return (
    <ThemeProvider theme={theme}>
      <StaffDashboardLayout user={mockUser} pageTitle="SimplyManage">
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
          {/* Placeholder Dialog */}
          <Dialog open={!!openDialog} onClose={handleCloseDialog}>
            <DialogTitle>{openDialog}</DialogTitle>
            <DialogContent>
              <Typography>
                This is a placeholder dialog for <b>{openDialog}</b>.<br />
              </Typography>
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
