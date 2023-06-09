import React, { useState, useEffect } from 'react';
import { Grid, Card, CardHeader, CardActions, LinearProgress, CardContent, Button, TextField, CircularProgress, Typography, Box, Avatar, Paper } from '@mui/material';
import { Link } from "react-router-dom";
import socket from '../../socket';
import { apiUrl } from '../../api/config';

function ListJobs() {
  const [jobs, setJobs] = useState([]);
  const [jobName, setJobName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch(`${apiUrl}/jobs`);
        const data = await response.json();

        setJobs(data.Jobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    }

    fetchJobs();
  }, []);

  function handleJobCreate(data) {
    console.log(data)
    setJobs(jobs => [data, ...jobs]);
  }
  
  
  function handleJobDelete(jobId) {
    const updatedJobs = jobs.filter(job => job.jobId !== jobId);
    setJobs(updatedJobs);
  }

  async function deleteJob(jobId) {
    try {
      const response = await fetch(`${apiUrl}/job/delete/${jobId}`, {
        method: 'GET'
      });
      const data = await response.json();

      if (data.status === 'ok') {
        handleJobDelete(jobId);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  }

  function handleDeleteJob(jobId) {
    if (window.confirm('Are you sure you want to delete this job?')) {
      deleteJob(jobId);
    }
  }
  

  React.useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });
    socket.on('Job:Create', handleJobCreate);
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
    
    return () => {
      // Remove event listeners
      socket.off('Job:Create', handleJobCreate);
    };
  }, [handleJobCreate]);

  async function createJob(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: jobName,
          description: jobDescription,
        }),
      });
      const data = await response.json();
      console.log(data)
      setLoading(false);
    } catch (error) {
      console.error('Error creating job:', error);
      setLoading(false);
    }
  }

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={12}>
          <Box m={2}>
            <Typography variant="h2">Job List</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
        <Paper sx={{ p: 2,mb: 2, borderRadius: 4 }}>
          <Box>
            <Card>
              <CardHeader title="Create a Job" />
              <CardContent>
                <TextField
                  label="Job Name"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Job Description"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                />
              </CardContent>
              <CardContent>
                <Button
                  onClick={createJob}
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Job'}
                </Button>
              </CardContent>
            </Card>
            </Box>
          </Paper>
        </Grid>
        </Grid>
        <Grid container spacing={2}>
        {jobs.map((job) => (
          <Grid item xs={12} sm={6} md={4} key={job.jobId}>
            <Paper sx={{ p: 2, borderRadius: 4 }}>
              <Box>
              <Card>
                <CardHeader
                  title={job.name}
                  avatar={<Avatar>{job.name[0]}</Avatar>}
                />
                <CardContent>
                  <p>{job.description}</p>
                </CardContent>
                <CardActions>
                  <Button component={Link} to={`/job/${job.jobId}`} variant="contained" color="primary" size="small">
                    View Job
                  </Button>
                  <Button onClick={() => handleDeleteJob(job.jobId)} variant="contained" color="secondary" size="small" style={{marginLeft: '10px'}}>
                    Delete Job
                  </Button>
                </CardActions>
                {job.status === 'inprogress' && (
                    <CardContent>
                      <LinearProgress />
                    </CardContent>)}
              </Card>
              </Box>
            </Paper>
          </Grid>
          ))}
    </Grid>
</div>
  )
}

export default ListJobs;
