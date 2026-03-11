import { createTheme, ThemeProvider } from '@mui/material';
import './App.css'
import Header from './Components/Header/Header'
import { Outlet } from 'react-router-dom';
import Footer from './Components/Footer';

// Global MUI theme configuration for the entire application.
// This centralizes color palette, typography, and component overrides
// so the UI stays visually consistent across all pages.
const theme = createTheme({
  palette: {
    primary: {
      main: '#4E780C',
    },
  },
  components: {
    // Global button styling — removes automatic uppercase text
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none'
        }
      }
    },
    // Ensures IconButtons also avoid forced uppercase styling
    MuiIconButton: {
      styleOverrides: {
        root: {
          textTransform: 'none'
        }
      }
    }
  },
  typography: {
    fontFamily: [
      '"Merriweather"',
      'Georgia',
      'serif'
    ].join(','),
  }
});

function App() {
  return (
    // ThemeProvider applies the custom MUI theme to the entire app
    <ThemeProvider theme={theme}>
      {/* Persistent header displayed on all pages */}
      <Header/>
      {/* Outlet renders the active child route inside App */}
      <Outlet />
      <Footer />
    </ThemeProvider>
  )
}

export default App
