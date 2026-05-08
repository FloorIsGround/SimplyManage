import React from 'react';
import StaffDashboardLayout from '../StaffDashboardLayout';
import theme from '../../../../utils/theme';
import { ThemeProvider, Typography, Box, CircularProgress } from '@mui/material';
import { useCurrentUser } from '../useCurrentUsers';

const LibrariesPage: React.FC = () => {
  const { user, loadingUser } = useCurrentUser();

  return (
    <ThemeProvider theme={theme}>
      {loadingUser ? (
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : user ? (
        <StaffDashboardLayout user={user} pageTitle="SimplyManage">
          <Box sx={{ background: '#fff', borderRadius: 2, p: 4, boxShadow: 1, mt: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Libraries Page
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This is where you can view and manage library branches and locations.
            </Typography>
          </Box>
        </StaffDashboardLayout>
      ) : (
        <Box sx={{ p: 4 }}>
          <Typography color="error">
            Failed to load user.
          </Typography>
        </Box>
      )}
    </ThemeProvider>
  );
};

export default LibrariesPage;
