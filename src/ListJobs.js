import React, { useState, useEffect } from 'react';
import { Grid, Card, CardHeader, CardContent, Button, TextField, CircularProgress } from '@mui/material';
import { Link, useNavigate } from "react-router-dom";

function ListJobs() {
  const [jobs, setJobs] = useState([]);
  const [jobName, setJobName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch('http://localhost:3000/jobs');
        const data = await response.json();
        setJobs(data.Jobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    }

    fetchJobs();
  }, []);

  async function createJob(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/job', {
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
      setLoading(false);

      if (data.status === 200) {
        navigate.push(`/job/${data.jobId}`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error creating job:', error);
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Job List</h2>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
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
        </Grid>
        {jobs.map((job) => (
          <Grid item xs={12} sm={6} md={4} key={job.job_id}>
            <Card>
              <CardHeader title={`${job.name}`} />
              <CardContent>
                <p>{job.description}</p>
              </CardContent>
              <CardContent>
                <Button component={Link} to={`/job/${job.job_id}`} variant="contained" color="primary">
                  View Job
                </Button>
              </CardContent>
            </Card>
          </Grid>
          ))}
  </Grid>
</div>
  )
}

export default ListJobs;
