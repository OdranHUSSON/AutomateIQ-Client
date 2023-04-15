import React, { useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { TextField, Button, createTheme, ThemeProvider, Grid, CircularProgress, FormControl, Select, MenuItem } from '@mui/material';
import MarkdownViewer from './MarkdownViewer';
import DynamicForm from './DynamicForm';

const apiUrl = 'http://localhost:3000';
const socket = io(apiUrl);

function App() {

  const endpoints = [
    {
      name: 'PRD Generation',
      url: '/api/generatePRD',
      details: {
        context: '',
        actors: '',
        initiative: ''
      }
    },
    {
      name: 'Task Debug Endpoint',
      url: '/api/taskTest',
      details: {
        context: '',
        actors: '',
        initiative: '',
        requirements: ''
      }
    },
    // add more endpoints here
  ];


  const [endpointDetails, setEndpointDetails] = useState({
    details: {},
    url: '',
  });

  const [selectedEndpoint, setSelectedEndpoint] = useState('');

  const handleEndpointChange = (event) => {
    setSelectedEndpoint(event.target.value);
    const selectedEndpointObj = endpoints.find((endpoint) => endpoint.name === event.target.value);
    console.log(selectedEndpointObj)
    setEndpointDetails({
      details: selectedEndpointObj.details,
      url: selectedEndpointObj.url,
    });
  };

  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEndpointDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProgress(0);
    setDone(false);
    const jobId = await startJob(endpointDetails.details, 1);
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

  const startJob = async (details, temperature) => {
    try {
      const response = await axios.post(apiUrl + endpointDetails.url, {
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
          <FormControl fullWidth>
          <Select value={selectedEndpoint} onChange={handleEndpointChange}>
            <MenuItem value="">
              Select an endpoint
            </MenuItem>
            {endpoints.map(endpoint => (
              <MenuItem key={endpoint.name} value={endpoint.name}>
                {endpoint.name}
              </MenuItem>
            ))}
          </Select>
          </FormControl>
            <form onSubmit={handleSubmit}>
            <DynamicForm endpointDetails={endpointDetails} handleInputChange={handleInputChange} />
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
