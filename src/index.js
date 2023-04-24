import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import { InputLabel, Button, createTheme, ThemeProvider, Grid, LinearProgress, FormControl, Select, MenuItem, ButtonGroup, Box } from '@mui/material';
import './index.css';
import App from './App';
import ListJobs from './ListJobs';
import reportWebVitals from './reportWebVitals';

function AppWrapper() {
  function Header() {
    const [ darkMode, setDarkMode ] = React.useState(true)
     
    React.useEffect(() => {
      const body = document.body
      const toggle = document.querySelector('.toggle-inner')
      
      if( darkMode === true ) {
        body.classList.add('dark-mode')
      } else {
        body.classList.remove('dark-mode')
      }
    }, [darkMode])
  }

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });
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
