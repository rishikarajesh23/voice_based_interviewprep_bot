// src/App.tsx
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import darkNeomorphismTheme from "./theme/index.ts";
import AppRoutes from './routes/AppRoutes'; // Your existing routes

function App() {
  return (
    <ThemeProvider theme={darkNeomorphismTheme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#121212',
                color: '#e0e0e0',
                border: '1px solid #333',
                borderRadius: '16px',
                boxShadow: '8px 8px 16px #0a0a0a, -8px -8px 16px #1a1a1a',
              },
            }}
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;