import { useEffect, useState } from "react";
import { Box, Typography, Paper, useTheme, CircularProgress } from "@mui/material";
import axios from "../../utils/axios-api";
import type { Library } from "../../Models/LibraryInfo/Library";

function HoursLocations() {
  const theme = useTheme();
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get("/hourslocations")
      .then(res => {
        console.log('API response:', res.data);
        setLibraries(Array.isArray(res.data.libraries) ? res.data.libraries : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load library locations.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }
  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  // ...existing code...

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4 }}>
      <Typography
        variant="h3"
        gutterBottom
        textAlign="center"
        color="primary"
      >
        Library Locations & Hours
      </Typography>
      {libraries.map(library => (
        <Paper
          key={library.id}
          sx={{
            p: 2,
            mb: 3,
            borderLeft: '6px solid',
            borderColor: 'success.main',
            borderRadius: 3,
            boxShadow: 2,
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 260,
            maxWidth: 700,
          }}
        >
          <Typography variant="h6" sx={{ color: theme.palette.secondary.main }}>{library.name}</Typography>
          <Typography variant="body2" color="text.secondary">{library.address}</Typography>
          <Typography variant="body2" color="text.secondary">Phone: {library.phoneNumber}</Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Hours:</Typography>
            {library.hours && library.hours.length > 0 ? (
              <Box sx={{ pl: 2, mb: 0 }}>
                {library.hours.map((h: { day: string; open: string; close: string }, idx: number) => (
                  <Typography key={idx} variant="body2" sx={{ display: 'block' }}>
                    {h.day}: {h.open} - {h.close}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Typography variant="body2">No hours listed.</Typography>
            )}
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

export default HoursLocations;