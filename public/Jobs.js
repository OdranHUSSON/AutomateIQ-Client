import React, { useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { InputLabel, Button, createTheme, ThemeProvider, Grid, LinearProgress, FormControl, Select, MenuItem, ButtonGroup, Box } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MarkdownViewer from './MarkdownViewer';
import DynamicForm from './DynamicForm';
import TaskTable from './Tasks';
import CustomizedSnackbars from './Snackbar';
import AddTaskForm from './addTaskForm';

const apiUrl = 'http://localhost:3000';
const socket = io(apiUrl);

function Jobs() {

  const [selectedEndpoint, setSelectedEndpoint] = useState('');

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
      name: 'Chat GPT',
      url: '/api/chatgpt',
      details: {
        prompt: '',
        temperature: '1',
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    reset();

    const jobId = await startJob(endpointDetails.details, 1);
    setJobId(jobId);
    updateJobAndTasks();
  };

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
  

  return (
    <ThemeProvider>
    <main>
      <div id="container">
      <Grid container spacing={2}>
      <Box mt={2} mb={2}>
      <Box mt={2} mb={4}>
                <DynamicForm endpointDetails={endpointDetails} handleInputChange={handleInputChange} />
              </Box>
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
      </Grid>
      </div>
    </main>
    </ThemeProvider>
  );
}

export default Jobs;
