import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";




const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  }
});


createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={darkTheme}> 
      <CssBaseline />
    <App />
    </ThemeProvider>
)
