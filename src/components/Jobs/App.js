import React, { useState } from 'react';
import io from 'socket.io-client';
import { Button, Grid, LinearProgress, Box, ButtonGroup, Paper, Card, CardContent, CardHeader, Avatar, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MarkdownViewer from '../MarkdownViewer/MarkdownViewer';
import TaskTable from '../Tasks/Tasks';
import AddTaskForm from '../Tasks/addTaskForm';
import socket from '../../socket';
import { apiUrl } from '../../api/config';

function App({ jobId }) {
  const [job, setJob] = useState({});
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [displayTask, setDisplayTask] = useState('');
  const [isRestarting, setIsRestarting] = useState(false);

  // TASKS 
  const [tasks, setTasks] = useState([]);

  const setAllTasks = (response) => {
    const newTasks = response.tasks.map((task) => ({
      id: task.taskId,
      job_id: task.jobId,
      status: task.status,
      name: task.name,
      output: task.output,
    }));
    setTasks(newTasks);
  };
  

  const addTask = (task) => {
    const newTask = {
      id: task.taskId,
      job_id: task.jobId,
      status: task.status,
      name: task.name,
      output: task.output
    };

    setTasks([...tasks, newTask]);
  };

  const addMultipleTasks = (tasks) => {
    const newTasks = tasks.map(task => ({
      id: task.taskId,
      job_id: task.jobId,
      status: task.status,
      name: task.name,
      output: task.output
    }));

    console.log('Added multiple tasks')
  
    setTasks(newTasks);
  };
  

  const handleTaskUpdate = (updatedTask) => {
    // Find the task with the given id and update its status and output
    setTasks(tasks => {
      return tasks.map(task => {
        if (task.id === updatedTask.taskId) {
          return { ...task, status: updatedTask.status, output: updatedTask.output };
        } else {
          return task;
        }
      });
    });
  
    if(updatedTask.status === 'done') {
      setDisplayTask(updatedTask);
    }
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  function reset() {
    setProgress(0);
    setTasks([]);
    setDone(false);
    setDisplayTask('');
  }

  const handleReset = async (event) => {
    event.preventDefault();
    reset();
  }

  const handleJobUpdate = async (data, ws = true) => {
    if (data.jobId == job.jobId) {
      setProgress(data.progress);
      if (data.progress == 100) {
        setDone(true);
        if(ws) updateJobAndTasks();
      }
    }
  };

  async function updateJobAndTasks() {
    if(jobId) {
      const response = await fetch(`${apiUrl}/jobs/${jobId}`);
      let data = await response.json();
      console.log(data)
      data.Job.jobId = data.Job.job_id;
      setJob(data.Job);
      setAllTasks(data.Job)
      handleJobUpdate(data.Job.jobId, false)
      setProgress(data.Job.progress)
      return data;
    }
  }


  function handleViewOutput(task) {
    setDisplayTask(task);
  }

  React.useEffect(() => {
    updateJobAndTasks();
  }, [jobId]);

  React.useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('message', 'Hello from client');
    });

    socket.on('Job:Update', (data) => {
      console.log(`JOB UPDATE CALLED ${data.jobId}`);
      console.log(data)
      if (data.jobId === jobId ) {
        handleJobUpdate(data, true);
      }
    });

    socket.on('Job:Delete', (data) => {
      console.log(`JOB DELETE CALLED ${data.jobId}`);
      console.log(data)
      if (data.jobId === jobId ) {
        deleteTask(data.taskId, true);
      }
    });
  
    socket.on('Task:Update', (data) => {
      console.log(`TASK UPDATE CALLED ${data.taskId}`);
      console.log(data)
      if (data.jobId === jobId ) {
        handleTaskUpdate(data);
      }
    });
  
    socket.on('Task:Create', (data) => {
      if (data.jobId === jobId ) {
        addTask(data);
      }
    });
  
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  
    socket.on('connect_error', (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  
    // Remove event listeners when component unmounts
    return () => {
      socket.off('connect');
      socket.off('Job:Update', handleJobUpdate);
      socket.off('Task:Update', handleTaskUpdate);
      socket.off('Task:Create', addTask);
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, [socket]);
  
  
  async function restartJob() {
    try {
      setIsRestarting(true);
      const response = await fetch(`${apiUrl}/job/restart/${jobId}`);
      const data = await response.json();
      console.log(response)

      if (response.ok) {
        console.log('Job restarted successfully:', data);
        setTasks(tasks => tasks.map(task => ({...task, status: 'pending'})));
        updateJobAndTasks();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error restarting the job:', error);
    } finally {
      setIsRestarting(false);
    }
  }
  
  

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <Paper sx={{ p: 2, borderRadius: 4 }}>
          <Card>
            {job.name && (
              <CardHeader
                title={job.name}
                avatar={<Avatar>{job.name[0]}</Avatar>}
              />
            )}
            <CardContent>
              <Typography>{job.description}</Typography>
              <Typography>jobId: {jobId}</Typography>
              {jobId && tasks && tasks.length > 0 && (
                <Box mt={2} mb={2}>
                  <div>
                    <Typography variant='h5'>Tasks</Typography>
                    <TaskTable tasks={tasks} onTaskUpdate={handleTaskUpdate} handleViewOutput={handleViewOutput} jobId={jobId} />
                  </div>
                </Box>
              )}
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
                          Restart
                        </Button>
                        <Button disabled={!jobId} type="button" onClick={updateJobAndTasks}>
                          <RefreshIcon />
                        </Button>
                      </ButtonGroup>
                    </form>
                  </div>
                )}
              </Box>
              <Typography variant='h5'>Add a task</Typography>
              <AddTaskForm jobId={jobId} tasks={tasks} />
            </CardContent>
          </Card>
        </Paper>
      </Grid>
      <Grid item xs={8}>
        <Paper sx={{ p: 2, borderRadius: 4 }}>
          <Box mt={2} mb={2}>
            <h2>Outputs</h2>
          </Box>
          <Box mt={2} mb={2} borderRadius={4}>
            {displayTask && <MarkdownViewer task={displayTask} />}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
  
}

export default App;