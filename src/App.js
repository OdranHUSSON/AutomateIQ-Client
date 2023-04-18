import React, { useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { InputLabel, Button, createTheme, ThemeProvider, Grid, LinearProgress, FormControl, Select, MenuItem, ButtonGroup, Box } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MarkdownViewer from './MarkdownViewer';
import DynamicForm from './DynamicForm';
import TaskTable from './Tasks';
import CustomizedSnackbars from './Snackbar';

const apiUrl = 'http://localhost:3000';
const socket = io(apiUrl);

function App() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [displayTask, setDisplayTask] = useState('');
  const [endpointDetails, setEndpointDetails] = useState({
    details: {},
    url: '',
  });

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
      name: 'Generate PRD',
      url: '/api/generatePRD',
      details: {
        context: '',
        actors: '',
        initiative: ''
      }
    },
  ];

  const handleEndpointChange = (event) => {
    setSelectedEndpoint(event.target.value);
    const selectedEndpointObj = endpoints.find((endpoint) => endpoint.name === event.target.value);
    setEndpointDetails({
      details: selectedEndpointObj.details,
      url: selectedEndpointObj.url,
    });
  };

  const handleInputChange = (event) => {

    const { name, value } = event.target;

    const updatedDetails = {
      ...endpointDetails.details,
      [name]: value
    };
  
    // Merge the updated object with the original endpointDetails object
    const updatedEndpointDetails = {
      ...endpointDetails,
      details: updatedDetails
    };

    setEndpointDetails((prevState) => (updatedEndpointDetails));
  };

  // TASKS 
  const [tasks, setTasks] = useState([]);

  const setAllTasks = (response) => {
    const newTasks = response.Tasks.map((task) => ({
      id: task.taskId,
      status: task.status,
      name: task.name,
      output: task.output,
    }));
  
    setTasks(newTasks);
  };
  

  const addTask = (task) => {
    const newTask = {
      id: task.taskId,
      status: task.status,
      name: task.name,
      output: task.output
    };

    setTasks([...tasks, newTask]);
  };

  const addMultipleTasks = (tasks) => {
    const newTasks = tasks.map(task => ({
      id: task.taskId,
      status: task.status,
      name: task.name,
      output: task.output
    }));

    console.log('Added multiple tasks')
  
    setTasks(newTasks);
  };
  

  const handleTaskUpdate = (updatedTask) => {
    // Find the task with the given id and update its status and output
    const updatedTasks = tasks.map(task => {
      if (task.id === updatedTask.taskId) {
        return { ...task, status: updatedTask.status, output: updatedTask.output };
      } else {
        return task;
      }
    });

    setTasks(updatedTasks);

    if(updatedTask.status = 'done') {
      setDisplayTask(updatedTask);
    }
  };

  function reset() {
    setProgress(0);
    setTasks([]);
    setDone(false);
    setJobId(null);
    setDisplayTask('');
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    reset();

    const jobId = await startJob(endpointDetails.details, 1);
    setJobId(jobId);
  };

  const handleReset = async (event) => {
    event.preventDefault();
    reset();
  }

  const handleJobUpdate = (data) => {
    if (data.jobId === jobId) {
      setProgress(data.progress);
      if (data.progress === 100) {
        setDone(true);
        updateJobAndTasks();
      }
    }
  };

  async function updateJobAndTasks() {
    const response = await fetch(`${apiUrl}/jobs/${jobId}`);
    const data = await response.json();
    console.log(data)
    setAllTasks(data)
    return data;
  }


  const startJob = async (details, temperature) => {
    try {
      const response = await axios.post(apiUrl + endpointDetails.url, {
        details: details,
        temperature: temperature,
      });
      console.log(response.data);
      addMultipleTasks(response.data.tasks)
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

  function handleViewOutput(task) {
    setDisplayTask(task);
  }

  React.useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('message', 'Hello from client');
    });
    socket.on('Job:Update', handleJobUpdate);
    socket.on('Task:Update', (data) => {
      if (data.jobId === jobId && data.status !== "pending") {
        handleTaskUpdate(data);
      }
    });
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
    socket.on('connect_error', (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
    return () => {
      // Remove event listeners
      socket.off('Job:Update', handleJobUpdate);
      socket.off('Task:Update', handleTaskUpdate);
    };
  }, [handleJobUpdate, handleTaskUpdate]);
  

  return (
    <ThemeProvider theme={darkTheme}>
    <main>
      <Header />
      <div id="container">
      <Grid container spacing={2}>
        <Grid xs={12} p={2}>
          <h1>AutomateIQ</h1>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid xs={4} p={2}>
          <Box mt={2} mb={2}>
            <h2>Inputs</h2>
          </Box>
          <Box mt={2} mb={2}>
            <FormControl fullWidth>
            <InputLabel id='endpoint'>Select a endpoint</InputLabel>
            <Select labelId='endpoint' label="Select a endpoint" value={selectedEndpoint} onChange={handleEndpointChange}>
              {endpoints.map(endpoint => (
                <MenuItem key={endpoint.name} value={endpoint.name}>
                  {endpoint.name}
                </MenuItem>
              ))}
            </Select>
            </FormControl>
          </Box>
          <Box mt={2} mb={2}>
            <form onSubmit={handleSubmit}>
              <Box mt={2} mb={4}>
                <DynamicForm endpointDetails={endpointDetails} handleInputChange={handleInputChange} />
              </Box>
              <ButtonGroup fullWidth aria-label="outlined primary button group">                
                <Button type="reset" onClick={handleReset}>Reset</Button>
                <Button variant="contained" type="submit">Generate</Button>
                {jobId && (
                  <Button type="button" onClick={updateJobAndTasks}>
                    <RefreshIcon />
                  </Button>
                )}
              </ButtonGroup>
            </form>
          </Box>
          <Box mt={2} mb={2}>
            {jobId && (
              <div>
                <h2>Job</h2>
                <p>Generating with jobId: {jobId}</p>
                { progress == 0 && <LinearProgress />} 
                {( progress > 0 ) && <LinearProgress variant="determinate" value={progress} />}
              </div>
            )}
          </Box>
        </Grid>
        <Grid xs={8} p={2}>
          <Box mt={2} mb={2}>
            {CustomizedSnackbars('This is a success message', 'success', done)}
            {tasks && tasks != [] && (
              <div>
                <h2>Tasks</h2>
                <TaskTable tasks={tasks} onTaskUpdate={handleTaskUpdate} handleViewOutput={handleViewOutput} />
              </div>
            )}
          </Box>
          <Box mt={2} mb={2}>
            <h2>Outputs</h2>
          </Box>
          <Box mt={2} mb={2}>
            {displayTask && (
              <MarkdownViewer task={displayTask}  />
            )}
          </Box>
        </Grid>
      </Grid>  
      </div>
    </main>
    </ThemeProvider>
  );
}

export default App;
