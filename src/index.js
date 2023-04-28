import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import { InputLabel, Button, createTheme, ThemeProvider, Grid, LinearProgress, FormControl, Select, MenuItem, ButtonGroup, Box, Typography, Alert } from '@mui/material';
import './index.css';
import App from './App';
import ListJobs from './ListJobs';
import reportWebVitals from './reportWebVitals';
import socket from './socket';

function AppWrapper() {
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketError, setSocketError] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      setSocketConnected(true);
      setSocketError(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Error connecting to socket IO server:', error);
      setSocketConnected(false);
      setSocketError(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
      setSocketError(false);
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
    };
  }, []);

  if (!socketConnected) {
    return (
      <div>
        <LinearProgress />
        <Box mt={2}>
          <Typography variant="h6">
            Connecting to socket IO server...
          </Typography>
        </Box>
      </div>
    );
  }

  if (socketError) {
    return (
      <div>
        <Box mt={2}>
          <Alert severity="error">
            Failed to connect to socket IO server. Please try again later.
          </Alert>
        </Box>
      </div>
    );
  }

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });
  function Header() {
    const [ darkMode, setDarkMode ] = React.useState(true)
     
    useEffect(() => {
      const body = document.body
      const toggle = document.querySelector('.toggle-inner')
      
      if( darkMode === true ) {
        body.classList.add('dark-mode')
      } else {
        body.classList.remove('dark-mode')
      }
    }, [darkMode])
  }

  return (
    <ThemeProvider theme={darkTheme}>
    <main>
      <Header />
      <div id="container">
      <Grid container spacing={2}>
        <Grid xs={12} p={2} item>
          <h1>AutomateIQ</h1>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Router>
          <Routes>
            <Route
              path="/"
              element={<ListJobs />}
            />
            <Route
              path="/job/:jobId?"
              element={<AppWrapperWithJobId />}
            />
          </Routes>
        </Router>
      </Grid>
      </div>
      </main>
      </ThemeProvider>
  );
}

function AppWrapperWithJobId() {
  const { jobId } = useParams();
  return <App jobId={jobId} />;
}

ReactDOM.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
