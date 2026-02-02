import { createTheme, ThemeProvider } from '@mui/material';
import './App.css'
import Header from './Components/Header/Header'

const theme = createTheme({
  palette: {
    primary: {
      main: '#4E780C',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none'
        }
      }
    },
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
    <ThemeProvider theme={theme}>
      <Header/>
    </ThemeProvider>
  )
}

export default App
