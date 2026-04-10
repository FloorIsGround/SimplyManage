import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();

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
          <Typography component="a" href="#contact" sx={{ color: 'white', textDecoration: 'underline', cursor: 'pointer' }}>
            Contact Us
          </Typography>
          <Typography component="a" href="#faq" sx={{ color: 'white', textDecoration: 'underline', cursor: 'pointer' }}>
            Help/FAQ
          </Typography>
          <Typography component="a" href="#hours" sx={{ color: 'white', textDecoration: 'underline', cursor: 'pointer' }}>
            Hours & Location
          </Typography>
          <Typography
            component="span"
            sx={{ color: 'white', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={() => navigate('/staff-dashboard')}
          >
            Staff/Admin Dashboard
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, fontSize: 12 }}>
          <Typography component="span">&copy; {new Date().getFullYear()} 
            SimplyManage Public Library
          </Typography>
          <Typography component="a" href="#terms" sx={{ color: 'white', textDecoration: 'underline', cursor: 'pointer' }}>
            Terms of Use
          </Typography>
          <Typography component="a" href="#privacy" sx={{ color: 'white', textDecoration: 'underline', cursor: 'pointer' }}>
            Privacy Policy
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Footer;
