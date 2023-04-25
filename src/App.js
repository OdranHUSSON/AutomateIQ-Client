import React, { useState } from 'react';
import io from 'socket.io-client';
import { Button, Grid, LinearProgress, Box, ButtonGroup } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MarkdownViewer from './MarkdownViewer';
import TaskTable from './Tasks';
import AddTaskForm from './addTaskForm';

const apiUrl = 'http://localhost:3000';
const socket = io(apiUrl);

function App({ jobId: initialJobId }) {
  const [jobId, setJobId] = useState(initialJobId);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [displayTask, setDisplayTask] = useState('');

  // TASKS 
  const [tasks, setTasks] = useState([]);

  const setAllTasks = (response) => {
    console.log(response)
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
    console.log('ici')
    console.log(task)
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
    setDisplayTask('');
  }

  const handleReset = async (event) => {
    event.preventDefault();
    reset();
  }

  const handleJobUpdate = async (data, ws = true) => {
    if (data.jobId === jobId) {
      setProgress(data.progress);
      if (data.progress === 100) {
        setDone(true);
        if(ws) {
          await updateJobAndTasks();
        }
      }
    }
  };

  async function updateJobAndTasks() {
    if(jobId) {
      const response = await fetch(`${apiUrl}/jobs/${jobId}`);
      let data = await response.json();
      data.Job.jobId = data.Job.job_id;
      console.log(data.Job)
      setAllTasks(data.Job)
      handleJobUpdate(data.Job, false)
      return data;
    }
  }

  React.useEffect(() => {
    updateJobAndTasks();
  }, [jobId]);

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
    return () => {
      // Remove event listeners
      socket.off('Job:Update', handleJobUpdate);
      socket.off('Task:Update', handleTaskUpdate);
    };
  }, [handleJobUpdate, handleTaskUpdate]);
  
  async function restartJob() {
    try {
      const response = await fetch(`${apiUrl}/job/restart/${jobId}`);
      const data = await response.json();
      console.log(response)
  
      if (response.ok) {
        console.log('Job restarted successfully:', data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error restarting the job:', error);
    }
  }
  

  return (
        <Grid container spacing={2}>
          <Grid xs={4} p={2} item>
            <Box mt={2} mb={2} p={2}>
              <h2>Inputs</h2>
            </Box>

            <Box mt={2} mb={2}>
              <form>
                <ButtonGroup fullWidth aria-label="outlined primary button group">                
                  <Button type="reset" onClick={handleReset}>Reset</Button>
                  <Button variant="contained" onClick={restartJob}>Restart</Button>
                    <Button disabled={jobId ? false : true}  type="button" onClick={updateJobAndTasks}>
                      <RefreshIcon />
                    </Button>
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
            {jobId && (
              <Box mt={2} mb={2}>
                {tasks && tasks != [] && (
                  <div>
                    <h2>Tasks</h2>
                    <TaskTable tasks={tasks} onTaskUpdate={handleTaskUpdate} handleViewOutput={handleViewOutput} jobId={jobId} />
                    <AddTaskForm jobId={jobId} tasks={tasks} />
                  </div>
                )}
              </Box>
            )}
          </Grid>
          <Grid xs={8} p={2} item>
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
  );
}

export default App;
