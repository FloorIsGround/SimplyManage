import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4E780C',
    },
    secondary: {
      main: '#355507',
      contrastText: '#fff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
  typography: {
    fontFamily: [
      '"Merriweather"',
      'Georgia',
      'serif',
    ].join(','),
  },
});

export default theme;
