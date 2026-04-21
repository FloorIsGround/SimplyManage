import React from 'react';
import type { User } from '../../../Models/User/User';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Avatar, Divider, Popover, Card, CardContent, CardActions, Button } from '@mui/material';
import SettingsPopup from './NavigationPages/SettingsPopup';
import { Dashboard, MenuBook, LocationOn, People, Settings } from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 145;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText || '#fff',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: theme.spacing(2)
  },
}));

const Main = styled('main')(({ theme }) => ({
  background: theme.palette.background.default,
  flexGrow: 1,
  minHeight: '100vh',
  padding: '12px 24px 32px 24px'
}));

const navItems = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/staff-dashboard' },
  { label: 'Books', icon: <MenuBook />, path: '/staff-dashboard/books' },
  { label: 'Libraries', icon: <LocationOn />, path: '/staff-dashboard/libraries' },
  { label: 'Users', icon: <People />, path: '/staff-dashboard/users' }
];

interface StaffDashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  user: User;
}

const StaffDashboardLayout: React.FC<StaffDashboardLayoutProps> = ({ children, pageTitle = 'SimplyManage', user }) => {
  const theme = useTheme();
  const [settingsAnchorEl, setSettingsAnchorEl] = React.useState<null | HTMLElement>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null); // For avatar menu
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <StyledDrawer variant="permanent" anchor="left">
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              width: 60,
              height: 56,
              background: theme.palette.background.paper,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
              mx: 'auto',
            }}
          >
            <LocalLibraryIcon sx={{ color: theme.palette.primary.main, fontSize: 40 }} />
          </Box>
        </Box>
        {/* Navigation */}
        <List sx={{ width: '100%' }}>
          {navItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton sx={{ justifyContent: 'flex-start', py: 2 }} onClick={() => navigate(item.path)}>
                <ListItemIcon sx={{ color: theme.palette.primary.contrastText || '#fff', minWidth: 40, justifyContent: 'flex-start' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      sx: { color: theme.palette.primary.contrastText || '#fff', fontSize: 14, textAlign: 'left', fontFamily: theme.typography.fontFamily }
                    }
                  }}
                  sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Divider sx={{ background: 'rgba(255,255,255,0.2)', width: '80%', mx: 'auto', my: 2 }} />
        <List sx={{ width: '100%' }}>
          <ListItem disablePadding>
            <ListItemButton
              sx={{ justifyContent: 'center', py: 2 }}
              onClick={e => setSettingsAnchorEl(e.currentTarget)}
            >
              <ListItemIcon sx={{ color: theme.palette.primary.contrastText || '#fff', minWidth: 0 }}>
                <Settings />
              </ListItemIcon>
              <ListItemText
                primary="Settings"
                slotProps={{
                  primary: {
                    sx: { color: theme.palette.primary.contrastText || '#fff', fontSize: 14, textAlign: 'center', fontFamily: theme.typography.fontFamily }
                  }
                }}
                sx={{ display: { xs: 'none', md: 'block' } }}
              />
            </ListItemButton>
          </ListItem>
        </List>
        <SettingsPopup
          open={Boolean(settingsAnchorEl)}
          anchorEl={settingsAnchorEl}
          onClose={() => setSettingsAnchorEl(null)}
        />
      </StyledDrawer>
      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', ml: `${drawerWidth}px` }}>
        <Main>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontFamily: theme.typography.fontFamily }}>
              {pageTitle}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 600, fontFamily: theme.typography.fontFamily }}>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 700, fontFamily: theme.typography.fontFamily }}>
                {typeof user.role === 'string' ? user.role : (typeof user.role === 'number' ? Object.keys(user.role)[user.role] : user.role)}
                {/* Update after Role is changed to enum in the backend */}
                {/* {Role[user.role]} */} 
              </Typography>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main, fontFamily: theme.typography.fontFamily }} />
              </IconButton>
              <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 240, boxShadow: 3 } } }}
              >
                <Card sx={{ minWidth: 240 }}>
                  <CardContent sx={{ pb: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 15, color: 'text.primary', textAlign: 'center', mb: 1 }}>
                      {user.email}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ flexDirection: 'column', gap: 0.5, pt: 0 }}>
                    <Button
                      variant="text"
                      color="primary"
                      fullWidth
                      size="medium"
                      onClick={() => {
                        localStorage.removeItem('token');
                        window.location.reload();
                      }}
                      sx={{ color: 'error.main', fontWeight: 600 }}
                    >
                      Log Out
                    </Button>
                  </CardActions>
                </Card>
              </Popover>
            </Box>
          </Box>
          <Box sx={{ width: '100%', height: 2, background: theme.palette.primary.main, borderRadius: 1, mb: 0 }} />
          {/* Main Content */}
          {children}
        </Main>
      </Box>
    </Box>
  );
};

export default StaffDashboardLayout;
