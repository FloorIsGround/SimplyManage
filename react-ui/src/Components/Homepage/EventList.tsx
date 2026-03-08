import { Box, Typography, Button, useTheme, CircularProgress } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import axiosServices from "../../utils/axios-api";
import { useEffect, useState } from "react";
import type { Event } from "../../Models/LibraryInfo/Event";

const EventList: React.FC = () => {
  const theme = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosServices.get("/events")
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load events.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }
  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
      {events.map((event: Event, idx: number) => (
        <Box
          key={idx}
          sx={{
            minWidth: 260,
            maxWidth: 320,
            flex: '1 1 260px',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 2,
            p: 2,
            borderLeft: '6px solid',
            borderColor: theme.palette.primary.main,
            display: 'flex',
            flexDirection: 'column',
            mb: 1,
            minHeight: 180,
            justifyContent: 'space-between',
            '&:hover': {
              boxShadow: 5,
              transform: 'translateY(-2px) scale(1.02)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CalendarTodayIcon sx={{ fontSize: 18, color: theme.palette.primary.main, mr: 1 }} />
            <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 700, fontFamily: 'inherit' }}>
              {event.title}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 15, fontFamily: 'inherit', mb: 1 }}>
            {event.date} &bull; {event.startTime} - {event.endTime}
          </Typography>
          <Typography sx={{ fontSize: 15, fontFamily: 'inherit', mb: 2 }}>{event.description}</Typography>
          <Button variant="outlined" color="primary" size="small" sx={{ alignSelf: 'flex-end', mt: 'auto' }}>
            Learn More
          </Button>
        </Box>
      ))}
    </Box>
  );
};

export default EventList;
