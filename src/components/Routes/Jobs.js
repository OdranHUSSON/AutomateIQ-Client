import React, { useState } from 'react';
import { Grid } from '@mui/material';
import socket from '../../socket';
import { apiUrl } from '../../api/config';
import OutputComponent from '../Tasks/outputComponent';
import ArgumentComponent from '../Jobs/ArgumentComponent';
import TaskComponent from '../Tasks/TaskComponent';
import JobComponent from '../Jobs/JobComponent';

function App({ jobId }) {
  const [job, setJob] = useState({});
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [displayTask, setDisplayTask] = useState('');
  const [isRestarting, setIsRestarting] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [argumentsState, setArgumentsState] = useState(null);

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
    alert('not implementend yet')
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
      data.Job.jobId = jobId;
      setJob(data.Job);
      setAllTasks(data.Job)
      setArgumentsState(data.Job.arguments);
      handleJobUpdate(data.Job, false)
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

  React.useEffect(() => {
    setAiDescription(getAiDescription(tasks))
  }, [tasks]);

  async function restartJob() {
    try {
      setIsRestarting(true);
      const response = await fetch(`${apiUrl}/job/restart/${jobId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ arguments: argumentsState })
      });
      const data = await response.json();

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

  async function getAiDescription (tasks) {
    let prePrompt = "Context: task automation application that can be chained and uses AI. A job can be composed of one or more tasks. From the list of task titles, write a short description to describe what the job is for.";
    console.log(tasks);
    let descriptionTasks = tasks.map(task => task.name);

    let prompt = prePrompt + "\n\n" + descriptionTasks.join("\n\n");
    console.log(prompt);
    try {
      const response = await fetch(`${apiUrl}/api/fastChatGPT`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          details: prompt
        })
      });

      return response.text;
    } catch (error) {
      console.error('Error on fetching ai job description:', error);
    }
  }


  function handleUpdateArguments(newArguments) {
    setArgumentsState(newArguments);
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <JobComponent
          job={job}
          progress={progress}
          handleReset={handleReset}
          restartJob={restartJob}
          isRestarting={isRestarting}
          jobId={jobId}
          updateJobAndTasks={updateJobAndTasks}
        />
        <ArgumentComponent
          argumentsState={argumentsState}
          jobId={jobId}
          handleUpdateArguments={handleUpdateArguments}
        />
        <TaskComponent
          jobId={jobId}
          tasks={tasks}
          handleTaskUpdate={handleTaskUpdate}
          argumentsState={argumentsState}
        />
      </Grid>
      <Grid item xs={8}>
        <OutputComponent tasks={tasks} />
      </Grid>
    </Grid>
  );

}

export default App;
