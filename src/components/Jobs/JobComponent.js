import React from 'react';
import { Card, CardContent, CardHeader, Avatar, TextField, Box, Paper, LinearProgress, ButtonGroup, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { jobIdField } from './JobIdField'

function JobComponent({ job, progress, handleReset, restartJob, isRestarting, jobId, updateJobAndTasks }) {
  return (
    <Paper sx={{ p: 2, borderRadius: 4 }}>
        <Card>
        {job.name && (
            <CardHeader
            title={job.name}
            avatar={<Avatar>{job.name[0]}</Avatar>}
            />
        )}
        <CardContent>
            <Box mb={2}>
            <TextField 
                variant="outlined"
                label="Description"
                fullWidth
                value={job.description}
            />
            </Box>
            <Box mt={2} mb={2}>
            <jobIdField jobId={jobId} />
            </Box>
            <Box mb={2}>
            {jobId && job.name && (
                <div>
                {progress === 0 && <LinearProgress />} 
                {progress > 0 && <LinearProgress variant="determinate" value={progress} />}
                <form>
                    <ButtonGroup fullWidth aria-label="outlined primary button group">                
                    <Button type="reset" onClick={handleReset}>Reset</Button>
                    <Button
                        variant="contained"
                        onClick={restartJob}
                        disabled={isRestarting || !jobId}
                    >
                        Start
                    </Button>
                    <Button disabled={!jobId} type="button" onClick={updateJobAndTasks} title={"force update"}>
                        <RefreshIcon />
                    </Button>
                    </ButtonGroup>
                </form>
                </div>
            )}
            </Box>
        </CardContent>
        </Card>
    </Paper>
  );
}

export default JobComponent;
