import { Box, Typography } from '@mui/material';
import Rating from '@mui/material/Rating';

export interface BookRatingProps {
  averageRating: number;
}

function BookRating({ averageRating }: BookRatingProps) {

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="subtitle2" sx={{ color: (theme) => theme.palette.primary.main, textAlign: 'center' }}>Average Rating</Typography>
      <Rating defaultValue={averageRating} precision={0.5} readOnly sx={{ mt: 0.5 }} />
    </Box>
  );
}

export default BookRating;
