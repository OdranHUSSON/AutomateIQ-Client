import React, { useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { TextField, Button, createTheme, ThemeProvider, Grid, CircularProgress, FormControl, Select, MenuItem } from '@mui/material';
import MarkdownViewer from './MarkdownViewer';
import DynamicForm from './DynamicForm';
import TaskTable from './Tasks';

const apiUrl = 'http://localhost:3000';
const socket = io(apiUrl);

function App() {
  const endpoints = [
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
    {
      name: 'Generate Card',
      url: '/api/generateCard',
      details: {
        context: '',
        actors: '',
        featureName: '',
        featureDescription: ''
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
    console.log(name);
    console.log(value)

    const updatedDetails = {
      ...endpointDetails.details,
      [name]: value
    };
  
    // Merge the updated object with the original endpointDetails object
    const updatedEndpointDetails = {
      ...endpointDetails,
      details: updatedDetails
    };

    console.log(updatedEndpointDetails)


    setEndpointDetails((prevState) => (updatedEndpointDetails));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProgress(0);
    setDone(false);
    const jobId = await startJob(endpointDetails.details, 1);
    setJobId(jobId);
  };

  // TASKS 
  const [tasks, setTasks] = useState([]);

  const addTask = (task) => {
    console.log(`ADDING TASK ${task.task_id}`);
    const newTask = {
      id: task.taskId,
      status: task.status,
      name: task.name,
      output: task.output
    };

    setTasks([...tasks, newTask]);
  };

  const handleTaskUpdate = (updatedTask) => {
    console.log("handle task udpate" + updatedTask.taskId)
    console.log(updatedTask)
    // Find the task with the given id and update its status and output
    let createTask = true;
    const updatedTasks = tasks.map(task => {
      if (task.id === updatedTask.taskId) {
        createTask = false;
        return { ...task, status: updatedTask.status, output: updatedTask.output };
      } else {
        return task;
      }
    });

    if(createTask) {
      console.log("Create task")
      addTask(updatedTask);
    } else {
      console.log("set task")
      setTasks(updatedTasks);
    }
  };

  socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('message', 'Hello from client');
  });

  socket.on('Job:Update', (data) => {
    if (data.jobId === jobId) {
      setProgress(data.progress);
      if (data.progress === 100) {
        setDone(true);
      }
    }
  });

  socket.on('Task:Create', (data) => {
    console.log(`${data.jobId}  jobId: ${jobId}`)
    if (data.jobId === jobId) {
      addTask(data);
    }
  });
  
  socket.on('Task:Update', (data) => {
    if (data.jobId === jobId) {
      handleTaskUpdate(data);
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
            <Button fullWidth variant="contained" type="submit">Generate</Button>
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
          <h2>Tasks</h2>
            <TaskTable tasks={tasks} onTaskUpdate={handleTaskUpdate} />
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
