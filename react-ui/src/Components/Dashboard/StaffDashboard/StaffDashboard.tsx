import { ThemeProvider, Paper, InputBase, IconButton, Button, Box, Typography } from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import StaffDashboardLayout from './StaffDashboardLayout';
import type { User } from '../../../Models/User/User';
import { Role, UserStatus } from '../../../Models/User/User';
import React from 'react';
import theme from '../../../utils/theme';

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
        <Box sx={{ background: '#fff', borderRadius: 2, p: 4, boxShadow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Books Page
          </Typography>
          {/* Search Bar */}
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
              sx={{ 
                background: theme.palette.primary.main, 
                color: theme.palette.primary.contrastText || '#fff', 
                textTransform: 'none', 
                fontWeight: 600, 
                boxShadow: 'none', 
                borderRadius: 2, 
                fontFamily: theme.typography.fontFamily 
              }}
              startIcon={<Add />}
            >
              Create Book
            </Button>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            This is where you can view, search, create, edit, and manage books in the library system. Use the search bar above to find books, or click "Create Book" to add a new one. You can also edit or delete existing books using the action buttons on the right.
          </Typography>
          {/* Table/list placeholder */}
          <Box 
            sx={{ 
              height: 240, 
              background: '#f7f7f9', 
              borderRadius: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#bbb', 
              fontSize: 18 }}
            >
            [Book list/table will appear here]
          </Box>
        </Box>
      </StaffDashboardLayout>
    </ThemeProvider>
  );
};

export default StaffDashboard;
