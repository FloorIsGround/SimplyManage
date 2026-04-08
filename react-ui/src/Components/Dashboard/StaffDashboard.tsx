import { ThemeProvider, Paper, InputBase, IconButton, Button, Box } from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import StaffDashboardLayout from './StaffDashboardLayout';
import type { User } from '../../Models/User/User';
import { Role, UserStatus } from '../../Models/User/User';
import React from 'react';
import theme from '../../utils/theme';

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

const StaffDashboard: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <StaffDashboardLayout user={mockUser}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32 }}>
          <h2 style={{ marginTop: 0, fontWeight: 700, color: '#222' }}>Books Page</h2>
          {/* Search bar and Create Book button below heading */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Paper
                component="form"
                sx={{ display: 'flex', alignItems: 'center', width: 400, boxShadow: 'none', border: '1px solid #eee', borderRadius: 2, px: 2 }}
              >
                <InputBase sx={{ ml: 1, flex: 1, fontFamily: theme.typography.fontFamily }} placeholder="Search" inputProps={{ 'aria-label': 'search' }} />
                <IconButton type="submit" sx={{ p: '10px', color: theme.palette.primary.main }} aria-label="search">
                  <Search />
                </IconButton>
              </Paper>
            </Box>
            <Button
              variant="contained"
              sx={{ background: theme.palette.primary.main, color: theme.palette.primary.contrastText || '#fff', textTransform: 'none', fontWeight: 600, boxShadow: 'none', borderRadius: 2, fontFamily: theme.typography.fontFamily }}
              startIcon={<Add />}
            >
              Create Book
            </Button>
          </Box>
          <p style={{ color: '#666', marginBottom: 24 }}>
            This is where you can view, search, create, edit, and manage books in the library system. Use the search bar above to find books, or click "Create Book" to add a new one. You can also edit or delete existing books using the action buttons on the right.
          </p>
          {/* Table/list placeholder */}
          <div style={{ height: 240, background: '#f7f7f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 18 }}>
            [Book list/table will appear here]
          </div>
        </div>
      </StaffDashboardLayout>
    </ThemeProvider>
  );
};

export default StaffDashboard;