import { Box, Typography } from "@mui/material";

function PatronDashboard() {
  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Patron Dashboard
      </Typography>
      <Typography variant="h5" color="primary" sx={{ mt: 4 }}>
        Coming Soon!
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        This page will let you manage your library account, view checked out books, holds, fees, and more.
      </Typography>
    </Box>
  );
}

export default PatronDashboard;