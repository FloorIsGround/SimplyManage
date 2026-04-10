import React from 'react';
import StaffDashboardLayout from '.././StaffDashboardLayout';
import type { User } from '../../../../Models/User/User';
import { Role, UserStatus } from '../../../../Models/User/User';
import theme from '../../../../utils/theme';
import { ThemeProvider, Typography, Box } from '@mui/material';

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

const UsersPage: React.FC = () => (
  <ThemeProvider theme={theme}>
    <StaffDashboardLayout user={mockUser} pageTitle="SimplyManage">
      <Box sx={{ background: '#fff', borderRadius: 2, p: 4, boxShadow: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Users Page
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is where you can view and manage users, staff, and patrons.
        </Typography>
      </Box>
    </StaffDashboardLayout>
  </ThemeProvider>
);

export default UsersPage;
