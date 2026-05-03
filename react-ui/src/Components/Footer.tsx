import { Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { hasStaffAccess } from "../utils/auth";

function Footer() {
  const canAccessStaff = hasStaffAccess();

  return (
    <Box component="footer" sx={{
      width: '100%',
      bgcolor: 'primary.main',
      color: 'white',
      borderRadius: 0,
      mt: 8,
      py: 3,
    }}>
      <Box sx={{ maxWidth: 1600, mx: 'auto', px: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 1 }}>
        <Typography
          component={RouterLink}
          to="/contact"
          sx={{ color: 'white', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Contact Us
        </Typography>
          <Typography
            component={RouterLink}
            to="/faqs"
            sx={{ color: 'white', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Help/FAQ
          </Typography>
          <Typography
            component={RouterLink}
            to="/hours-locations"
            sx={{ color: 'white', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Hours & Location
          </Typography>
          {canAccessStaff && (
            <Typography
              component={RouterLink}
              to="/staff-dashboard"
              sx={{ color: 'white', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Staff/Admin Dashboard
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, fontSize: 12 }}>
          <Typography component="span">&copy; {new Date().getFullYear()} 
            SimplyManage Public Library
          </Typography>
          <Typography
            component={RouterLink}
            to="/terms-of-use"
            sx={{ color: 'white', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Terms of Use
          </Typography>
          <Typography
            component={RouterLink}
            to="/privacy-policy"
            sx={{ color: 'white', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Privacy Policy
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Footer;
