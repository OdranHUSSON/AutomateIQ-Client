import React, { useState, useEffect } from 'react';
import { Grid, Card, CardHeader, CardContent, Button } from '@mui/material';
import { Link } from "react-router-dom";

function ListJobs() {
  const [jobs, setJobs] = useState([]);

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

  return (
    <div>
      <h2>Job List</h2>
      <Grid container spacing={2}>
        {jobs.map((job) => (
          <Grid item xs={12} sm={6} md={4} key={job.job_id}>
            <Card>
              <CardHeader title={`Job ID: ${job.job_id}`} />
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
  );
}

export default ListJobs;
