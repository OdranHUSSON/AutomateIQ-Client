import React, { useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { TextField, Button, createTheme, ThemeProvider, Grid, CircularProgress } from '@mui/material';
import MarkdownViewer from './MarkdownViewer';


const apiUrl = 'http://localhost:3000';
const socket = io(apiUrl);



function App() {
  const [details, setDetails] = useState({
    context: '',
    actors: '',
    initiative: '',
  });

  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const fields = Object.keys(details).map((fieldName) => (
    <TextField
      fullWidth
      id="standard-basic"
      onChange={handleInputChange}
      label={fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
      variant="standard"
      name={fieldName}
    />
  ));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProgress(0);
    setDone(false);
    const jobId = await generatePRD(details, 1);
    setJobId(jobId);
  };

  socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('message', 'Hello from client');
  });

  socket.on('update', (data) => {
    console.log(`Server says job ${data.jobId} has progressed to : ${data.progress}`);
    if (data.jobId === jobId) {
      setProgress(data.progress);
      if (data.progress === 100) {
        setDone(true);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  socket.on('connect_error', (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  const generatePRD = async (details, temperature) => {
    try {
      const response = await axios.post(apiUrl + '/api/generatePRD', {
        details: details,
        temperature: temperature,
      });
      return response.data.jobId;
    } catch (error) {
      console.log(error);
      throw new Error(error.response.data.error);
    }
  };
  
  
  function Header() {
    const [ darkMode, setDarkMode ] = React.useState(true)
     
    React.useEffect(() => {
      const body = document.body
      const toggle = document.querySelector('.toggle-inner')
      
      // If dark mode is enabled - adds classes to update dark-mode styling.
      // Else, removes and styling is as normal.
      if( darkMode === true ) {
        body.classList.add('dark-mode')
        toggle.classList.add('toggle-active')
      } else {
        body.classList.remove('dark-mode')
        toggle.classList.remove('toggle-active')
      }
    }, [darkMode])
    
    return (
      <header>
        <div
          id="toggle"
          onClick={() => darkMode === false ? setDarkMode(true) : setDarkMode(false)}
        >
          <div className="toggle-inner"/>
        </div>
      </header>
    )
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
        <Grid xs={4}>
          <div>
            <form onSubmit={handleSubmit}>
            {fields}
            <Button fullWidth variant="contained" type="submit">Generate PRD</Button>
            </form>
            {jobId && (
              <div>
                <p>Generating with jobId: {jobId}</p>
                { progress == 0 && <CircularProgress />} 
                {( progress > 0 ) && <CircularProgress variant="determinate" value={progress} />}
                {done && <p>Done!</p>}
              </div>
            )}
          </div>
        </Grid>
        <Grid xs={8}>
          <h2>Outputs</h2>
          {jobId && (
            <MarkdownViewer jobId={jobId} progress={progress} />
          )}
        </Grid>
      </Grid>  
      </div>
    </main>
    </ThemeProvider>
  );
}

export default App;
