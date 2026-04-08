import { ThemeProvider } from '@mui/material';
import './App.css';
import Header from './Components/Header/Header';
import { Outlet } from 'react-router-dom';
import Footer from './Components/Footer';
import theme from './utils/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Header />
      <Outlet />
      <Footer />
    </ThemeProvider>
  );
}

export default App
