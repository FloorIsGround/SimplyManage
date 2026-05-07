import React, { useEffect, useState } from 'react';
import StaffDashboardLayout from '../StaffDashboardLayout';
import type { User } from '../../../../Models/User/User';
import theme from '../../../../utils/theme';
import { ThemeProvider, Typography, Box, CircularProgress } from '@mui/material';
import axios from '../../../../utils/axios-api';
import { jwtDecode } from 'jwt-decode';

const LibrariesPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    let userId: string | undefined;

    try {
      const decoded: any = jwtDecode(token);
      userId = decoded.id || decoded.userId || decoded._id;
    } catch {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    if (!userId) {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    axios.get(`/users/${userId}`)
      .then((res: any) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
  }, []);

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